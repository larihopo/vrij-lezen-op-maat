"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { API_BASE_URL } from "@/lib/api";

type Role = "student" | "docent";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type Session = {
  token: string;
  user: User;
};

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "unavailable";

type AuthContextType = {
  session: Session | null;
  ready: boolean;
  authStatus: AuthStatus;
  login: (session: Session) => void;
  logout: () => void;
  retrySession: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "vrijlezen-session";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [authStatus, setAuthStatus] =
    useState<AuthStatus>("loading");

  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      setAuthStatus("loading");

      const stored = sessionStorage.getItem(STORAGE_KEY);

      if (!stored) {
        if (active) {
          setSession(null);
          setAuthStatus("unauthenticated");
        }
        return;
      }

      let saved: Session;

      try {
        saved = JSON.parse(stored) as Session;

        if (!saved.token || !saved.user) {
          throw new Error("Ongeldige sessiegegevens");
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);

        if (active) {
          setSession(null);
          setAuthStatus("unauthenticated");
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/check`,
          {
            headers: {
              Authorization: `Bearer ${saved.token}`,
            },
            cache: "no-store",
          }
        );

        if (!active) return;

        if (response.status === 401) {
          sessionStorage.removeItem(STORAGE_KEY);
          setSession(null);
          setAuthStatus("unauthenticated");
          return;
        }

        if (!response.ok) {
          setSession(null);
          setAuthStatus("unavailable");
          return;
        }

        setSession(saved);
        setAuthStatus("authenticated");
      } catch {
        if (!active) return;

        // Netwerkfout: bewaar het token.
        // Geef nog geen toegang zolang het niet geverifieerd is.
        setSession(null);
        setAuthStatus("unavailable");
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [retry]);

  function login(newSession: Session) {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newSession)
    );

    setSession(newSession);
    setAuthStatus("authenticated");
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setAuthStatus("unauthenticated");
  }

  function retrySession() {
    setAuthStatus("loading");
    setRetry((previous) => previous + 1);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        ready: authStatus !== "loading",
        authStatus,
        login,
        logout,
        retrySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth moet binnen AuthProvider staan"
    );
  }

  return context;
}
