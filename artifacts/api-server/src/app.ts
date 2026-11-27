import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import https from "https";
import type { OutgoingHttpHeaders } from "http";
import fs from "fs";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PYTHON_BACKEND_HOST = "python-fastapi-backend-ez3s.onrender.com";
const RETRYABLE_UPSTREAM_STATUSES = new Set([502, 503, 504]);
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

let inFlightWarmup: Promise<boolean> | null = null;
let lastWarmOkAt = 0;
const WARM_CACHE_MS = 60_000;

function triggerBackendWarmup(): Promise<boolean> {
  if (inFlightWarmup) return inFlightWarmup;

  inFlightWarmup = new Promise<boolean>((resolve) => {
    const req = https.request(
      {
        hostname: PYTHON_BACKEND_HOST,
        port: 443,
        path: "/health",
        method: "GET",
        headers: { Accept: "application/json" },
      },
      (upstreamRes) => {
        const ok = (upstreamRes.statusCode ?? 500) >= 200 && (upstreamRes.statusCode ?? 500) < 300;
        upstreamRes.resume();
        upstreamRes.on("end", () => {
          if (ok) lastWarmOkAt = Date.now();
          resolve(ok);
        });
      },
    );

    req.setTimeout(45_000, () => {
      req.destroy();
      resolve(false);
    });

    req.on("error", () => {
      resolve(false);
    });

    req.end();
  }).finally(() => {
    inFlightWarmup = null;
  });

  return inFlightWarmup;
}

function handleHealthWarmup(_req: Request, res: Response) {
  if (Date.now() - lastWarmOkAt < WARM_CACHE_MS) {
    res.status(200).json({ status: "ok", service: "TravelMind API" });
    return;
  }

  const warmupPromise = triggerBackendWarmup();
  let responded = false;

  const timer = setTimeout(() => {
    if (!responded && !res.headersSent) {
      responded = true;
      res.status(200).json({ status: "warming", service: "TravelMind API" });
    }
  }, 4000);

  warmupPromise.then((ok) => {
    clearTimeout(timer);
    if (!responded && !res.headersSent) {
      responded = true;
      res.status(200).json({
        status: ok ? "ok" : "warming",
        service: "TravelMind API",
      });
    }
  });
}

function proxyToPython(req: Request, res: Response) {
  const backendPath = req.originalUrl.replace(/^\/api/, "");
  const hasBody =
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    req.body &&
    Object.keys(req.body).length > 0;
  const body = hasBody ? JSON.stringify(req.body) : undefined;

  const headers: OutgoingHttpHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Length"] = Buffer.byteLength(body);
  }

  const maxAttempts = 4;
  const retryDelaysMs = [2000, 4000, 6000];
  let clientClosed = false;
  let activeProxyReq: ReturnType<typeof https.request> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  res.on("close", () => {
    if (!res.writableEnded) {
      clientClosed = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (activeProxyReq && !activeProxyReq.destroyed) {
        activeProxyReq.destroy();
      }
    }
  });

  const attemptRequest = (attempt: number) => {
    if (clientClosed || res.headersSent) return;

    const options: https.RequestOptions = {
      hostname: PYTHON_BACKEND_HOST,
      port: 443,
      path: backendPath,
      method: req.method,
      headers,
    };

    const proxyReq = https.request(options, (proxyRes) => {
      const statusCode = proxyRes.statusCode ?? 500;

      if (RETRYABLE_UPSTREAM_STATUSES.has(statusCode)) {
        proxyRes.resume();
        if (attempt < maxAttempts && !clientClosed) {
          const delay = retryDelaysMs[attempt - 1] ?? 4000;
          logger.warn(
            { statusCode, attempt, delay, path: backendPath },
            "Upstream backend waking up; retrying request",
          );
          retryTimer = setTimeout(() => attemptRequest(attempt + 1), delay);
          return;
        }
        if (!res.headersSent && !clientClosed) {
          res.status(503).json({
            detail: "The trip planning service is waking up. Please try again in a moment.",
          });
        }
        return;
      }

      if (statusCode >= 200 && statusCode < 300) {
        lastWarmOkAt = Date.now();
      }

      if (clientClosed || res.headersSent) {
        proxyRes.resume();
        return;
      }

      res.status(statusCode);
      Object.entries(proxyRes.headers).forEach(([k, v]) => {
        if (v !== undefined && !HOP_BY_HOP_HEADERS.has(k.toLowerCase())) {
          res.setHeader(k, v);
        }
      });
      proxyRes.pipe(res, { end: true });
    });

    activeProxyReq = proxyReq;

    proxyReq.setTimeout(120_000, () => {
      proxyReq.destroy(new Error("Python backend proxy timeout"));
    });

    proxyReq.on("error", (err) => {
      if (clientClosed) return;
      if (attempt < maxAttempts) {
        const delay = retryDelaysMs[attempt - 1] ?? 4000;
        logger.warn(
          { err, attempt, delay, path: backendPath },
          "Python backend proxy transient error; retrying",
        );
        retryTimer = setTimeout(() => attemptRequest(attempt + 1), delay);
        return;
      }
      logger.error({ err, path: backendPath }, "Python backend proxy error");
      if (!res.headersSent) {
        res
          .status(502)
          .json({ detail: "Python backend unavailable. Please wait and retry." });
      }
    });

    if (body !== undefined) {
      proxyReq.write(body);
    }
    proxyReq.end();
  };

  attemptRequest(1);
}

app.all("/api/health", handleHealthWarmup);
app.all("/api/session/*splat", proxyToPython);
app.use("/api", router);

const candidateDistPaths = [
  path.resolve(process.cwd(), "artifacts", "travelmind", "dist", "public"),
  path.resolve(__dirname, "..", "..", "travelmind", "dist", "public"),
  path.resolve(process.cwd(), "..", "travelmind", "dist", "public"),
];
const distPath =
  candidateDistPaths.find((p) => fs.existsSync(p)) ?? candidateDistPaths[0];

app.use(express.static(distPath));

app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

export default app;
