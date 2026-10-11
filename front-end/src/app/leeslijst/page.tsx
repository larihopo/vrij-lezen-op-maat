"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import {
  fetchReadingList,
  updateReadingStatus,
  type ReadingListItem,
} from "@/lib/reading-list";

export default function LeeslijstPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [items, setItems] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(
    null
  );
  const [retry, setRetry] = useState(0);

  // Leeslijst ophalen uit PostgreSQL en MongoDB
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadReadingList() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchReadingList(
          token!,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setItems(result.items);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Je leeslijst kon niet worden geladen."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadReadingList();

    return () => controller.abort();
  }, [token, retry]);

  // Wisselen tussen gelezen en niet gelezen
  async function handleToggle(item: ReadingListItem) {
    if (!token || updatingId !== null) return;

    const newStatus = !item.isRead;

    setUpdatingId(item.id);
    setError("");
    setMessage("");

    try {
      await updateReadingStatus(
        token,
        item.id,
        newStatus
      );

      setItems((previous) =>
        previous.map((current) =>
          current.id === item.id
            ? { ...current, isRead: newStatus }
            : current
        )
      );

      setMessage(
        newStatus
          ? "Boek gemarkeerd als gelezen."
          : "Boek gemarkeerd als niet gelezen."
      );
    } catch {
      setError(
        "De leesstatus kon niet worden aangepast."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const readCount = items.filter(
    (item) => item.isRead
  ).length;

  return (
    <main className="container">
      <header className="catalog-header">
        <h1>Mijn leeslijst</h1>
        <p>
          Bewaar interessante boeken en houd bij
          welke titels je hebt gelezen.
        </p>
      </header>

      {loading ? (
        <div role="status">
          <p>Je leeslijst wordt geladen...</p>

          <div className="catalog-grid" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="book-card" key={index}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-short" />
              </div>
            ))}
          </div>
        </div>
      ) : error && items.length === 0 ? (
        <div className="catalog-message" role="alert">
          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => setRetry((n) => n + 1)}
          >
            Opnieuw proberen
          </button>
        </div>
      ) : (
        <>
          <div className="reading-list-summary">
            <p>
              <strong>{items.length}</strong> boeken op
              je leeslijst
            </p>

            <p>
              <strong>{readCount}</strong> gelezen
            </p>
          </div>

          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {items.length === 0 ? (
            <div className="catalog-message">
              <h2>Je leeslijst is nog leeg</h2>
              <p>
                Ontdek boeken in de catalogus en voeg
                ze toe aan je persoonlijke leeslijst.
              </p>

              <Link
                href="/catalogus"
                className="primary-button button-link"
              >
                Boeken ontdekken
              </Link>
            </div>
          ) : (
            <ul className="reading-list-grid">
              {items.map((item) => {
                const title =
                  item.book?.title ??
                  "Boek niet meer beschikbaar";

                return (
                  <li key={item.id}>
                    <article className="book-card">
                      <span className="reading-status">
                        {item.isRead
                          ? "Gelezen"
                          : "Nog niet gelezen"}
                      </span>

                      <h2>{title}</h2>

                      {item.book?.author && (
                        <p className="book-card__author">
                          Door {item.book.author}
                        </p>
                      )}

                      <p>
                        {item.book?.description ||
                          "De informatie over dit boek is niet meer beschikbaar."}
                      </p>

                      <button
                        type="button"
                        className="pagination-button"
                        disabled={updatingId !== null}
                        onClick={() =>
                          handleToggle(item)
                        }
                        aria-label={`Markeer ${title} als ${
                          item.isRead
                            ? "niet gelezen"
                            : "gelezen"
                        }`}
                      >
                        {updatingId === item.id
                          ? "Bijwerken..."
                          : item.isRead
                            ? "Markeer als niet gelezen"
                            : "Markeer als gelezen"}
                      </button>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
