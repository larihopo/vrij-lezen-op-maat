"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SiteHeader() {
  const { session, ready, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="site-brand">
          Vrij lezen op maat
        </Link>

        <nav className="site-nav" aria-label="Hoofdnavigatie">
          <Link href="/">Home</Link>
          <Link href="/catalogus">Catalogus</Link>

          {ready && session?.user.role === "student" && (
            <>
              <Link href="/profiel">Leesprofiel</Link>
              <Link href="/advies">Mijn leesadvies</Link>
              <Link href="/leeslijst">Mijn leeslijst</Link>
            </>
          )}

          {ready && session?.user.role === "docent" && (
            <Link href="/docent">Docentenomgeving</Link>
          )}

          {ready && !session && (
            <Link href="/login">Inloggen</Link>
          )}

          {ready && session && (
            <button
              type="button"
              onClick={handleLogout}
              className="nav-button"
            >
              Uitloggen
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
