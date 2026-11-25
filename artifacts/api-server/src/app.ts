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
  };
  if (body !== undefined) {
    headers["Content-Length"] = Buffer.byteLength(body);
  }

  const options: https.RequestOptions = {
    hostname: "python-fastapi-backend-ez3s.onrender.com",
    port: 443,
    path: backendPath,
    method: req.method,
    headers,
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode ?? 500);
    Object.entries(proxyRes.headers).forEach(([k, v]) => {
      if (v !== undefined) res.setHeader(k, v);
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.setTimeout(120000, () => {
    proxyReq.destroy(new Error("Python backend proxy timeout"));
  });

  proxyReq.on("error", (err) => {
    logger.error({ err }, "Python backend proxy error");
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
}

app.all("/api/health", proxyToPython);
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
