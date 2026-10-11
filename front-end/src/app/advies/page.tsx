"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import BookCard from "@/components/BookCard";
import { useAuth } from "@/context/AuthContext";

import {
  fetchAdvice,
  AdviceRequestError,
  type AdviceResponse,
} from "@/lib/advice";

type AdviceError = {
  message: string;
  status: number | null;
};

export default function AdviesPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [advice, setAdvice] =
    useState<AdviceResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AdviceError | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadAdvice() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAdvice(
          token!,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setAdvice(result);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setAdvice(null);

        if (err instanceof AdviceRequestError) {
          let message = "Je leesadvies kon niet worden geladen.";

          if (err.status === 409) {
            message =
              "Je hebt nog geen leesprofiel. Vul eerst je profiel in.";
          } else if (err.status === 422) {
            message =
              "Er zijn momenteel onvoldoende boeken beschikbaar voor drie adviezen.";
          } else if (err.status === 401) {
            message =
              "Je sessie is verlopen. Log opnieuw in.";
          }

          setError({
            message,
            status: err.status,
          });
        } else {
          setError({
            message:
              "De server is niet bereikbaar. Probeer het opnieuw.",
            status: null,
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAdvice();

    return () => controller.abort();
  }, [token, retry]);

  return (
    <main className="container">
      <header className="catalog-header">
        <h1>Jouw persoonlijke leesadvies</h1>
        <p>
          Op basis van jouw leesprofiel hebben we drie
          leessuggesties voor je geselecteerd.
        </p>
      </header>

      {loading ? (
        <div role="status">
          <p>Jouw leesadviezen worden samengesteld...</p>

          <div className="catalog-grid" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="book-card book-card--skeleton"
              >
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-short" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="catalog-message" role="alert">
          <p>{error.message}</p>

          <div className="profile-actions">
            {error.status === 409 && (
              <Link
                href="/profiel"
                className="primary-button button-link"
              >
                Leesprofiel invullen
              </Link>
            )}

            {error.status === 401 && (
              <Link
                href="/login"
                className="primary-button button-link"
              >
                Opnieuw inloggen
              </Link>
            )}

            <button
              type="button"
              className="pagination-button"
              onClick={() => setRetry((n) => n + 1)}
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      ) : advice ? (
        <>
          <p className="catalog-count" role="status">
            {advice.total} persoonlijke leesadviezen gevonden.
          </p>

          <div className="catalog-grid">
            {advice.items.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  ...book,
                  author: null,
                }}
                reason={book.reason}
              />
            ))}
          </div>

          <div className="advice-actions">
            <p>
              Zijn je interesses veranderd? Pas je
              leesprofiel aan voor een nieuw advies.
            </p>

            <Link
              href="/profiel"
              className="pagination-button button-link"
            >
              Leesprofiel aanpassen
            </Link>
          </div>
        </>
      ) : null}
    </main>
  );
}
