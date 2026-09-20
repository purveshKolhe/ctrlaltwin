import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import { toast } from "sonner";

const BENEFITS = [
  "Turn a rough idea into a polished video",
  "AI-written scripts and cinematic visuals",
  "Your entire video library in one place",
];

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem("presentor_users") || "[]");
  } catch {
    return [];
  }
};

const persistUsers = (users) => {
  localStorage.setItem("presentor_users", JSON.stringify(users));
};

const nextPath = (path) => {
  if (path === "auth") {
    window.history.pushState({}, "", "/auth");
  } else {
    window.history.pushState({}, "", "/studio");
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export default function Auth() {
  const [mode, setMode] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const submit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword || (mode === "signup" && !trimmedName)) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (trimmedPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const users = readUsers();

    if (mode === "signup") {
      const existing = users.find((user) => user.email === trimmedEmail);
      if (existing) {
        toast.error("An account with that email already exists.");
        return;
      }

      const user = { name: trimmedName, email: trimmedEmail, password: trimmedPassword };
      persistUsers([...users, user]);
      localStorage.setItem("presentor_session", JSON.stringify({ name: trimmedName, email: trimmedEmail }));
      toast.success("Welcome aboard. Your studio is ready.");
      nextPath("studio");
      return;
    }

    const existingUser = users.find(
      (user) => user.email === trimmedEmail && user.password === trimmedPassword,
    );

    if (!existingUser) {
      toast.error("We couldn’t find a matching account. Please check your details.");
      return;
    }

    localStorage.setItem(
      "presentor_session",
      JSON.stringify({ name: existingUser.name, email: existingUser.email }),
    );
    toast.success("Signed in successfully.");
    nextPath("studio");
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-3xl" />

      <section className="relative hidden w-1/2 flex-col justify-between border-r border-white/10 p-10 lg:flex">
        <button onClick={goHome} className="flex w-fit items-center gap-3" aria-label="Back to home">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-xl font-black text-primary-foreground">
            P
          </span>
          <span className="font-display text-xl font-black tracking-tight">
            PRESENTOR<span className="text-primary">.</span>
          </span>
        </button>
        <div className="max-w-lg pb-8">
          <span className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-4 w-4" /> Your next idea starts here
          </span>
          <h1 className="font-display text-6xl font-black leading-[0.92] tracking-tighter">
            Make the idea impossible to ignore.
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
            Join creators turning a blank page into a presenter-ready video before the meeting
            starts.
          </p>
          <div className="mt-9 space-y-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-sm text-foreground/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                  <Check className="h-3 w-3 text-primary" />
                </span>
                {benefit}
              </div>
            ))}
          </div>
        </div>
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30">
          Idea in · Presenter video out
        </p>
      </section>

      <section className="relative flex w-full items-center justify-center px-6 py-28 sm:px-10 lg:w-1/2">
        <button
          onClick={goHome}
          className="absolute left-6 top-7 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </button>
        <div className="w-full max-w-md">
          <div className="mb-9">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 lg:hidden">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-4xl font-black tracking-tight">
              {mode === "signup" ? "Start creating." : "Welcome back."}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Create your free account and bring your first idea to life."
                : "Sign in to continue creating presenter videos."}
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {[
              ["signup", "Create account"],
              ["login", "Sign in"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`rounded-lg py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  mode === value ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold transition-colors hover:bg-white/[0.08]">
            <span className="font-bold text-lg">G</span> Continue with Google
          </button>
          <div className="my-6 flex items-center gap-4 text-[0.65rem] font-mono uppercase tracking-widest text-white/25">
            <span className="h-px flex-1 bg-white/10" /> Or use email <span className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-muted-foreground">Your name</span>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Alex Morgan"
                  className="auth-input"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="auth-input"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-muted-foreground">Password</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                <input
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="auth-input pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <button type="submit" className="cta-primary group mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-mono text-xs font-bold uppercase tracking-wider">
              {mode === "signup" ? "Create free account" : "Sign in"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
          <p className="mt-6 text-center text-xs leading-relaxed text-white/30">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}
