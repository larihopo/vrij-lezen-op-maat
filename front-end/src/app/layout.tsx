
import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthProvider } from "@/context/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import RouteGuard from "@/components/RouteGuard";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vrij lezen op maat",
  description: "Persoonlijke leesadviezen voor studenten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <AuthProvider>
          <a href="#main-content" className="skip-link">
            Ga naar hoofdinhoud
          </a>

          <SiteHeader />

          <div id="main-content" tabIndex={-1}>
            <Suspense
              fallback={
                <div className="container" role="status">
                  Pagina laden...
                </div>
              }
            >
              <RouteGuard>{children}</RouteGuard>
            </Suspense>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
