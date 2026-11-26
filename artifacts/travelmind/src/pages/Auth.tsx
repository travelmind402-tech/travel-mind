import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { FlowButton } from "@/components/ui/flow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrapbookSticker, useParallaxOffset } from "@/components/ScrapbookStickers";
import { PageFloatingStickers } from "@/components/PageFloatingStickers";
import { ArrowLeft, Eye, EyeOff, PlaneTakeoff } from "lucide-react";

type AuthMode = "login" | "signup";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();
  const parallax = useParallaxOffset(12);

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
      {/* LEFT TWO-THIRDS: Full-height collage artwork panel (top banner on mobile) */}
      <aside className="lg:col-span-8 relative overflow-hidden bg-[#1F4F5B] text-[#FFEBAF] min-h-[220px] sm:min-h-[260px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-[#163E48]">
        {/* Subtle halftone texture on dark teal backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#FFEBAF 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Animated collage stickers */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute right-6 top-10 w-28 lg:w-44 pointer-events-none"
          style={{
            transform: `translate3d(${parallax.x * 0.6}px, ${parallax.y * -0.5}px, 0)`,
          }}
        >
          <div className="animate-sticker-float" style={{ ["--sticker-rot" as string]: "8deg" }}>
            <ScrapbookSticker variant="envelope" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden md:block absolute left-10 bottom-28 w-28 lg:w-36 pointer-events-none"
          style={{
            transform: `translate3d(${parallax.x * -0.5}px, ${parallax.y * 0.5}px, 0)`,
          }}
        >
          <div className="animate-sticker-float-alt" style={{ ["--sticker-rot" as string]: "-7deg" }}>
            <ScrapbookSticker variant="statue" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden lg:block absolute right-[28%] top-[18%] w-32 pointer-events-none"
          style={{
            transform: `translate3d(${parallax.x * -0.3}px, ${parallax.y * 0.3}px, 0)`,
          }}
        >
          <div className="animate-sticker-float" style={{ ["--sticker-rot" as string]: "-10deg" }}>
            <ScrapbookSticker variant="newsbird" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden lg:block absolute right-14 bottom-16 w-28 pointer-events-none"
          style={{
            transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0)`,
          }}
        >
          <div className="animate-sticker-float-alt" style={{ ["--sticker-rot" as string]: "10deg" }}>
            <ScrapbookSticker variant="speech" />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="hidden xl:block absolute left-[42%] bottom-14 w-24 pointer-events-none"
        >
          <div className="animate-sticker-float" style={{ ["--sticker-rot" as string]: "6deg" }}>
            <ScrapbookSticker variant="star" />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-note text-[#FFEBAF]/85 hover:text-[#FFEBAF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-2xl my-auto py-4 lg:py-0">
          <div className="inline-block bg-[#4C9DB0] text-[#163E48] px-3 py-1 rounded-full font-note text-xs font-bold border border-[#FFEBAF]/60 mb-4">
            Your trip, thought through
          </div>
          <h1 className="font-display uppercase text-4xl sm:text-5xl lg:text-7xl leading-[0.95] tracking-wide text-[#FFEBAF] text-balance">
            YOUR NEXT TRIP STARTS HERE.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#FFEBAF]/85 max-w-md hidden sm:block">
            Keep your travel profile ready across visits—from weather prep and local phrases to budgets and street eats.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center gap-3 font-note text-xs text-[#FFEBAF]/80">
          <span>7 specialist briefings</span>
          <span aria-hidden="true">·</span>
          <span>Email & password account</span>
        </div>
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
