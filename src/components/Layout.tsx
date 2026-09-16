import { Link, Outlet } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/stations" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          ChargeHub
        </Link>
        <div className="topbar-right">
          <span className="muted">{user?.full_name}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
