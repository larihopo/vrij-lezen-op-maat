"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuth, type Session } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        setError(
          response.status === 401
            ? "Ongeldige e-mail of wachtwoord."
            : "Inloggen is mislukt. Probeer het opnieuw."
        );
        return;
      }

      const data: Session = await response.json();

      login(data);

      if (data.user.role === "docent") {
        router.replace("/docent");
      } else {
        router.replace("/profiel");
      }
    } catch {
      setError("De server is niet bereikbaar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Inloggen</h1>
      <p>Log in om je persoonlijke leesomgeving te openen.</p>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-field">
          <label htmlFor="email">E-mailadres</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Wachtwoord</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Bezig met inloggen..." : "Inloggen"}
        </button>
      </form>
    </main>
  );
}
