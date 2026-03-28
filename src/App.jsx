import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabase";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import AnimalCreatePage from "./pages/AnimalCreatePage";
import AnimalDetailPage from "./pages/AnimalDetailPage";
import AnimalEditPage from "./pages/AnimalEditPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Session betöltési hiba:", error.message);
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return <div style={{ padding: 24 }}>Betöltés...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage session={session} />} />

      <Route element={<ProtectedRoute session={session} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />

          <Route path="/animals/new" element={<AnimalCreatePage />} />
          <Route path="/admin/new" element={<AnimalCreatePage />} />

          <Route path="/animals/:id" element={<AnimalDetailPage />} />

          <Route path="/animals/:id/edit" element={<AnimalEditPage />} />
          <Route
            path="/admin/animals/:id/edit"
            element={<AnimalEditPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}