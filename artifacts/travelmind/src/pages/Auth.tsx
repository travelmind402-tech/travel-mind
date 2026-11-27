import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { FlowButton } from "@/components/ui/flow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageFloatingStickers } from "@/components/PageFloatingStickers";
import { Eye, EyeOff, PlaneTakeoff } from "lucide-react";

type AuthMode = "login" | "signup";

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
      {/* LEFT TWO-THIRDS: Full-bleed mountain ridge photograph (top banner on mobile) */}
      <aside className="lg:col-span-8 relative overflow-hidden bg-[#1F4F5B] min-h-[240px] sm:min-h-[300px] lg:min-h-screen border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-[#163E48]">
        <img
          src="/assets/aistudio/IMG_20250226_071355_bd94df76.jpg"
          alt="Snow-dusted mountain ridge trail with cabins"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </aside>

      {/* RIGHT ONE-THIRD: Auth form */}
      <main className="lg:col-span-4 relative overflow-hidden flex flex-col justify-center px-5 py-10 sm:px-10 bg-[#FFEBAF]">
        <PageFloatingStickers variant="auth" />
        <div className="relative z-10 w-full max-w-sm mx-auto space-y-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-2xl tracking-wide text-[#163E48]">
            <span className="w-8 h-8 rounded-full bg-[#4C9DB0] border-[1.5px] border-[#1F4F5B] flex items-center justify-center">
              <PlaneTakeoff className="w-4 h-4 text-[#163E48]" />
            </span>
            <span>TRAVELMIND</span>
          </Link>

          <div className="paper-card rounded-3xl p-6 sm:p-7 space-y-5">
            {/* Segmented Mode Toggle */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#FFEBAF]/70 border border-[#4C9DB0]/65"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => switchMode("login")}
                className={`py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#1F4F5B] text-[#FFEBAF] shadow-sm"
                    : "text-[#2A5C69] hover:text-[#163E48]"
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => switchMode("signup")}
                className={`py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-[#1F4F5B] text-[#FFEBAF] shadow-sm"
                    : "text-[#2A5C69] hover:text-[#163E48]"
                }`}
              >
                Sign up
              </button>
            </div>

            <div>
              <h2 className="font-display uppercase text-2xl tracking-wide text-[#163E48]">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="font-note text-xs text-[#2A5C69] mt-1">
                {mode === "login"
                  ? "Sign in with your email and password."
                  : "Set up an email and password to get started."}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-name" className="text-sm font-semibold text-[#163E48]">
                    Name *
                  </Label>
                  <Input
                    id="auth-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 bg-[#FFEBAF]/45 border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/35 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-sm font-semibold text-[#163E48]">
                  Email *
                </Label>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-[#FFEBAF]/45 border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/35 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="auth-password" className="text-sm font-semibold text-[#163E48]">
                  Password *
                </Label>
                <div className="relative">
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
                    className="h-11 pr-11 bg-[#FFEBAF]/45 border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/35 rounded-xl"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#2A5C69] hover:text-[#163E48] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-confirm-password" className="text-sm font-semibold text-[#163E48]">
                    Confirm password *
                  </Label>
                  <div className="relative">
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
                      className="h-11 pr-11 bg-[#FFEBAF]/45 border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/35 rounded-xl"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-[#2A5C69] hover:text-[#163E48] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/25 text-[#163E48] text-xs sm:text-sm font-medium"
                >
                  {formError}
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
          </div>
        </div>
      </main>
    </div>
  );
}
