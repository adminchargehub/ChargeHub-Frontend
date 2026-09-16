import { type FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const { user, loading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@chargehub.ng");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("chargehub123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="centered muted">Loading…</div>;
  if (user) return <Navigate to="/stations" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, fullName, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="centered">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="brand brand-lg">
          <span className="brand-mark" aria-hidden="true" />
          ChargeHub
        </div>
        <p className="muted auth-sub">
          {mode === "login" ? "Sign in to book an outlet." : "Create your account."}
        </p>

        {mode === "register" && (
          <label className="field">
            <span>Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
        >
          {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
