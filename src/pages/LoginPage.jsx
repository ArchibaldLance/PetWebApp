import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage({ session }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (session) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage(
          "A felhasználó létrejött. Most már be tudsz lépni ezzel az email/jelszó párossal."
        );
        setMode("login");
      }
    } catch (error) {
      setErrorMessage(error.message || "Ismeretlen hiba történt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 24 }}>
      <h1>{mode === "login" ? "Belépés" : "Egyszeri regisztráció"}</h1>
      <p style={{ color: "#666" }}>
        {mode === "login"
          ? "Csak bejelentkezett felhasználó láthatja az alkalmazást."
          : "Ezt csak egyszer használd a saját accountod létrehozására."}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="Email cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Folyamatban..."
            : mode === "login"
            ? "Belépés"
            : "Regisztráció"}
        </button>
      </form>

      {message ? (
        <p style={{ color: "green", marginTop: 12 }}>{message}</p>
      ) : null}

      {errorMessage ? (
        <p style={{ color: "crimson", marginTop: 12 }}>{errorMessage}</p>
      ) : null}
    </div>
  );
}