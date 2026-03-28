import { supabase } from "../lib/supabase";
import { NavLink, Outlet } from "react-router-dom";

async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Kilépési hiba:", error.message);
  }
}

export default function Layout() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-branding">
            <h1 className="site-title">Háziállat nyilvántartó</h1>
            <p className="site-subtitle">
              Egyszerű nyilvántartás az állatok adataihoz és kezeléseihez
            </p>
          </div>

          <nav className="site-nav" aria-label="Fő navigáció">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Főoldal
            </NavLink>

            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Admin
            </NavLink>

            <NavLink
              to="/animals/new"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Új állat
            </NavLink>

            <button type="button" onClick={handleLogout}>
              Kilépés
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p>
            © {currentYear} Háziállat nyilvántartó. React, Supabase és Netlify
            alapokon.
          </p>
        </div>
      </footer>
    </div>
  );
}