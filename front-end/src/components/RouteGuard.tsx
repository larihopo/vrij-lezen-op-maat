"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Role = "student" | "docent";

function getRequiredRole(pathname: string): Role | null {
  const studentRoutes = [
    "/profiel",
    "/leeslijst",
    "/advies",
  ];

  const docentRoutes = ["/docent"];

  const matches = (route: string) =>
    pathname === route ||
    pathname.startsWith(`${route}/`);

  if (studentRoutes.some(matches)) {
    return "student";
  }

  if (docentRoutes.some(matches)) {
    return "docent";
  }

  return null;
}

export default function RouteGuard({
  children,
}: {
  children: ReactNode;
}) {
  const {
    session,
    authStatus,
    retrySession,
  } = useAuth();

  const pathname = usePathname();
  const router = useRouter();

  const requiredRole = getRequiredRole(pathname);

  const hasAccess =
    authStatus === "authenticated" &&
    session?.user.role === requiredRole;

  useEffect(() => {
    if (
      !requiredRole ||
      authStatus === "loading" ||
      authStatus === "unavailable"
    ) {
      return;
    }

    if (authStatus === "unauthenticated") {
      router.replace("/login");
    } else if (!hasAccess) {
      router.replace("/");
    }
  }, [
    requiredRole,
    authStatus,
    hasAccess,
    router,
  ]);

  // Publieke pagina
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Sessie wordt gecontroleerd
  if (authStatus === "loading") {
    return (
      <main className="container">
        <p role="status">Toegang controleren...</p>
      </main>
    );
  }

  // Back-end tijdelijk niet bereikbaar
  if (authStatus === "unavailable") {
    return (
      <main className="container">
        <h1>Verbinding niet beschikbaar</h1>

        <p role="alert">
          De server is momenteel niet bereikbaar.
          Je sessie is bewaard.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={retrySession}
        >
          Opnieuw verbinden
        </button>
      </main>
    );
  }

  // Niet ingelogd of verkeerde rol
  if (!hasAccess) {
    return (
      <main className="container">
        <p role="status">
          Geen toegang. Je wordt doorgestuurd...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
