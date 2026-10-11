"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import {
  fetchTeacherStudentDetail,
  TeacherDashboardApiError,
  type TeacherStudentDetail,
} from "@/lib/teacher-dashboard";

import TeacherBookPicker from "@/components/TeacherBookPicker";

export default function DocentStudentPage() {
  const params = useParams<{ studentId: string }>();

  const { session } = useAuth();
  const token = session?.token;

  const studentId = Number(params.studentId);
  const invalidStudentId =
    !Number.isSafeInteger(studentId) || studentId < 1;

  const [detail, setDetail] =
    useState<TeacherStudentDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] =
    useState<number | null>(null);

  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token || invalidStudentId) return;

    const controller = new AbortController();

    async function loadStudent() {
      setLoading(true);
      setError("");
      setErrorStatus(null);
      setDetail(null);

      try {
        const result = await fetchTeacherStudentDetail(
          token!,
          studentId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setDetail(result);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err instanceof TeacherDashboardApiError) {
          setErrorStatus(err.status);

          if (err.status === 404) {
            setError(
              "Deze student is niet gevonden of is " +
              "niet aan jou gekoppeld."
            );
          } else if (err.status === 401) {
            setError(
              "Je sessie is verlopen. Log opnieuw in."
            );
          } else if (err.status === 403) {
            setError(
              "Je hebt geen toegang tot deze pagina."
            );
          } else {
            setError(
              "De studentgegevens konden niet worden geladen."
            );
          }
        } else {
          setError(
            "De server is niet bereikbaar. " +
            "Probeer het opnieuw."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadStudent();

    return () => controller.abort();
  }, [token, studentId, invalidStudentId, retry]);

  return (
    <main className="container">
      <Link
        href="/docent"
        className="teacher-back-link"
      >
        ← Terug naar mijn studenten
      </Link>

      {invalidStudentId ? (
        <div className="catalog-message" role="alert">
          <h1>Student niet beschikbaar</h1>
          <p>Ongeldig student-ID.</p>
          <Link href="/docent">Terug naar studentenoverzicht</Link>
        </div>
      ) : loading ? (
        <div role="status">
          <p>Studentgegevens laden...</p>

          <div
            className="catalog-grid"
            aria-hidden="true"
          >
            {[1, 2].map((index) => (
              <div className="book-card" key={index}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="catalog-message" role="alert">
          <h1>Student niet beschikbaar</h1>
          <p>{error}</p>

          {errorStatus === 401 ? (
            <Link
              href="/login"
              className="primary-button button-link"
            >
              Opnieuw inloggen
            </Link>
          ) : (
            <Link
              href="/docent"
              className="pagination-button button-link"
            >
              Naar studentenoverzicht
            </Link>
          )}

          {errorStatus !== 404 &&
            errorStatus !== 403 && (
              <button
                type="button"
                className="pagination-button"
                onClick={() => setRetry((n) => n + 1)}
              >
                Opnieuw proberen
              </button>
            )}
        </div>
      ) : detail ? (
        <>
          <header className="catalog-header">
            <h1>{detail.student.name}</h1>
            <p>{detail.student.email}</p>
          </header>

          <section
            className="teacher-detail-section"
            aria-labelledby="profile-heading"
          >
            <h2 id="profile-heading">Leesprofiel</h2>

            {detail.profile ? (
              <dl className="teacher-profile-list">
                <div>
                  <dt>Leesniveau</dt>
                  <dd>{detail.profile.niveau}</dd>
                </div>

                <div>
                  <dt>Genre</dt>
                  <dd>{detail.profile.genre}</dd>
                </div>

                <div>
                  <dt>Onderwerp</dt>
                  <dd>{detail.profile.onderwerp}</dd>
                </div>

                <div>
                  <dt>Gewenste lengte</dt>
                  <dd>{detail.profile.lengte}</dd>
                </div>

                <div>
                  <dt>Leesdoel</dt>
                  <dd>{detail.profile.leesdoel}</dd>
                </div>
              </dl>
            ) : (
              <p>Geen leesprofiel beschikbaar.</p>
            )}
          </section>

          <section
            className="teacher-detail-section"
            aria-labelledby="reading-list-heading"
          >
            <h2 id="reading-list-heading">
              Persoonlijke leeslijst
            </h2>

            <p>
              {detail.readingList.total} boeken,
              waarvan{" "}
              {
                detail.readingList.items.filter(
                  (item) => item.isRead
                ).length
              }{" "}
              gelezen.
            </p>

            <TeacherBookPicker
              token={token!}
              studentId={studentId}
              onAdded={() => {
                setRetry((previous) => previous + 1);
              }}
            />

            {detail.readingList.items.length === 0 ? (
              <p>
                Deze student heeft nog geen boeken
                op de leeslijst.
              </p>
            ) : (
              <ul className="reading-list-grid">
                {detail.readingList.items.map((item) => (
                  <li key={item.id}>
                    <article className="book-card">
                      <span className="reading-status">
                        {item.isRead
                          ? "Gelezen"
                          : "Nog niet gelezen"}
                      </span>

                      <h3>
                        {item.book?.title ??
                          "Boek niet meer beschikbaar"}
                      </h3>

                      {item.book?.author && (
                        <p className="book-card__author">
                          Door {item.book.author}
                        </p>
                      )}

                      <p>
                        {item.book?.description ||
                          "Geen beschrijving beschikbaar."}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
