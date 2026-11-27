import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { FlowButton } from "@/components/ui/flow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageFloatingStickers } from "@/components/PageFloatingStickers";
import {
  Eye,
  EyeOff,
  PlaneTakeoff,
  Mail,
  Lock,
  User,
  AlertCircle,
} from "lucide-react";

type AuthMode = "login" | "signup";

const INPUT_CLASS =
  "h-12 pl-11 bg-[#FFF8DC]/80 border-[1.5px] border-[#4C9DB0] rounded-xl text-[#163E48] placeholder:text-[#2A5C69]/60 " +
  "transition-shadow focus-visible:border-[#1F4F5B] focus-visible:ring-4 focus-visible:ring-[#4C9DB0]/30";

const COPY: Record<AuthMode, { title: string; sub: string }> = {
  login: {
    title: "Welcome back",
    sub: "Sign in with your email and password.",
  },
  signup: {
    title: "Create your account",
    sub: "Set up an email and password to get started.",
  },
};

/** Field with a leading icon that highlights on focus. */
function Field({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative group">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2A5C69] transition-colors group-focus-within:text-[#1F4F5B] pointer-events-none z-10">
        {icon}
      </span>
      {children}
    </div>
  );
}

function PasswordToggle({
  shown,
  onToggle,
  label,
}: {
  shown: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={shown ? `Hide ${label}` : `Show ${label}`}
      onClick={onToggle}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#2A5C69] hover:text-[#163E48] hover:bg-[#4C9DB0]/20 transition-colors cursor-pointer z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F4F5B]"
    >
      {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

function getStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s;
}

const STRENGTH_LABEL = ["Too short", "Weak", "Okay", "Good", "Strong"];
const STRENGTH_COLOR = ["#4C9DB0", "#D9822B", "#E0A526", "#4C9DB0", "#1F4F5B"];

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = useMemo(() => getStrength(password), [password]);
  const copy = COPY[mode];

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError(null);
  };

  const validateClient = (): string | null => {
    const trimmedEmail = email.trim();
    if (mode === "signup") {
      if (name.trim().length < 2) {
        return "Please enter your name (at least 2 characters).";
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (mode === "signup" && password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErr = validateClient();
    if (validationErr) {
      setFormError(validationErr);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        });
      }
      setLocation("/plan");
    } catch (err: any) {
      setFormError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 paper-texture text-[#163E48]">
      <style>{`
        @keyframes tm-ticket { from { opacity: 0; transform: translateY(18px) rotate(1.5deg); } to { opacity: 1; transform: translateY(0) rotate(0deg); } }
        @keyframes tm-field { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .tm-ticket { animation: tm-ticket .7s cubic-bezier(.2,.8,.2,1) both; }
        .tm-field { animation: tm-field .3s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .tm-ticket, .tm-field { animation: none !important; }
        }
      `}</style>

      {/* LEFT: photograph */}
      <aside className="lg:col-span-8 relative overflow-hidden bg-[#1F4F5B] min-h-[240px] sm:min-h-[300px] lg:min-h-screen border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-[#163E48]">
        <img
          src="/assets/aistudio/IMG-20260725-WA0005_7c6f82fe.jpg"
          alt="Dramatic clouds over a high mountain river valley"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </aside>

      {/* RIGHT: auth form */}
      <main className="lg:col-span-4 relative overflow-hidden flex flex-col justify-center px-5 py-10 sm:px-10 bg-[#FFEBAF]">
        <PageFloatingStickers variant="auth" />
        <div className="relative z-10 w-full max-w-sm mx-auto space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-display text-2xl tracking-wide text-[#163E48]"
          >
            <span className="w-8 h-8 rounded-full bg-[#4C9DB0] border-[1.5px] border-[#1F4F5B] flex items-center justify-center">
              <PlaneTakeoff className="w-4 h-4 text-[#163E48]" />
            </span>
            <span>TRAVELMIND</span>
          </Link>

          {/* Boarding-pass card */}
          <div className="tm-ticket relative">
            {/* tape strips */}
            <span className="absolute -top-2.5 left-7 w-14 h-5 -rotate-6 bg-[#4C9DB0]/60 z-20" />
            <span className="absolute -top-2.5 right-7 w-14 h-5 rotate-3 bg-[#4C9DB0]/60 z-20" />

            <div className="paper-card rounded-3xl overflow-hidden">
              {/* ticket stub: mode switch */}
              <div className="p-5 sm:p-6 pb-5">
                <div
                  role="tablist"
                  aria-label="Authentication mode"
                  className="relative flex p-1 rounded-xl bg-[#FFEBAF]/70 border border-[#4C9DB0]/65"
                >
                  <span
                    aria-hidden
                    className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/2)] rounded-lg bg-[#1F4F5B] shadow-sm transition-transform duration-300 ease-out"
                    style={{ transform: mode === "login" ? "translateX(0)" : "translateX(100%)" }}
                  />
                  {(["login", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => switchMode(m)}
                      className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4F5B] ${
                        mode === m ? "text-[#FFEBAF]" : "text-[#2A5C69] hover:text-[#163E48]"
                      }`}
                    >
                      {m === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>
              </div>

              {/* perforation */}
              <div className="relative h-0" aria-hidden>
                <div className="absolute inset-x-5 top-0 border-t-2 border-dashed border-[#4C9DB0]/70" />
                <span className="absolute -left-3.5 -top-3.5 w-7 h-7 rounded-full bg-[#FFEBAF] border-[1.5px] border-[#163E48]" />
                <span className="absolute -right-3.5 -top-3.5 w-7 h-7 rounded-full bg-[#FFEBAF] border-[1.5px] border-[#163E48]" />
              </div>

              {/* ticket body */}
              <div className="p-5 sm:p-6 pt-7 space-y-5">
                <div>
                  <h2 className="font-display uppercase text-2xl tracking-wide text-[#163E48]">
                    {copy.title}
                  </h2>
                  <p className="font-note text-sm text-[#2A5C69] mt-1">{copy.sub}</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {mode === "signup" && (
                    <div className="tm-field space-y-1.5">
                      <Label htmlFor="auth-name" className="text-sm font-semibold text-[#163E48]">
                        Name *
                      </Label>
                      <Field icon={<User className="w-4 h-4" />}>
                        <Input
                          id="auth-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          placeholder="Alex Rivera"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </Field>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="auth-email" className="text-sm font-semibold text-[#163E48]">
                      Email *
                    </Label>
                    <Field icon={<Mail className="w-4 h-4" />}>
                      <Input
                        id="auth-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="auth-password" className="text-sm font-semibold text-[#163E48]">
                      Password *
                    </Label>
                    <Field icon={<Lock className="w-4 h-4" />}>
                      <Input
                        id="auth-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        required
                        minLength={8}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${INPUT_CLASS} pr-11`}
                      />
                      <PasswordToggle
                        shown={showPassword}
                        onToggle={() => setShowPassword((v) => !v)}
                        label="password"
                      />
                    </Field>

                    {mode === "signup" && password.length > 0 && (
                      <div className="tm-field flex items-center gap-2 pt-1" aria-live="polite">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                              style={{
                                backgroundColor: i <= strength ? STRENGTH_COLOR[strength] : "#4C9DB0",
                                opacity: i <= strength ? 1 : 0.25,
                              }}
                            />
                          ))}
                        </div>
                        <span className="font-note text-xs text-[#2A5C69] w-14 text-right">
                          {STRENGTH_LABEL[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  {mode === "signup" && (
                    <div className="tm-field space-y-1.5">
                      <Label
                        htmlFor="auth-confirm-password"
                        className="text-sm font-semibold text-[#163E48]"
                      >
                        Confirm password *
                      </Label>
                      <Field icon={<Lock className="w-4 h-4" />}>
                        <Input
                          id="auth-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          minLength={8}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`${INPUT_CLASS} pr-11`}
                        />
                        <PasswordToggle
                          shown={showConfirmPassword}
                          onToggle={() => setShowConfirmPassword((v) => !v)}
                          label="confirm password"
                        />
                      </Field>
                    </div>
                  )}

                  {formError && (
                    <div
                      role="alert"
                      className="tm-field flex items-start gap-2 p-3 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/25 text-[#163E48] text-xs sm:text-sm font-medium"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <FlowButton
                    type="submit"
                    size="lg"
                    variant="primary"
                    loading={submitting}
                    disabled={submitting}
                    text={
                      submitting
                        ? mode === "login"
                          ? "Signing in..."
                          : "Creating account..."
                        : mode === "login"
                          ? "Log in"
                          : "Create account"
                    }
                    className="w-full"
                  />
                </form>

                <p className="font-note text-sm text-center text-[#2A5C69]">
                  {mode === "login" ? "New to TravelMind?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                    className="font-bold text-[#163E48] underline decoration-[#4C9DB0] decoration-2 underline-offset-4 hover:decoration-[#1F4F5B] cursor-pointer"
                  >
                    {mode === "login" ? "Create an account" : "Log in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
