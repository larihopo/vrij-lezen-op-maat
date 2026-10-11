"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import {
  fetchTeacherStudents,
  type TeacherStudent,
} from "@/lib/teacher-dashboard";

export default function DocentPage() {
  const { session } = useAuth();
  const token = session?.token;

  const [students, setStudents] = useState<
    TeacherStudent[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function loadStudents() {
      setLoading(true);
      setError("");
      setStudents([]);

      try {
        const result = await fetchTeacherStudents(
          token!,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setStudents(result.students);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "De studenten konden niet worden geladen. " +
            "Controleer je verbinding en probeer het opnieuw."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadStudents();

    return () => controller.abort();
  }, [token, retry]);

  return (
    <main className="container">
      <header className="catalog-header">
        <h1>Docentenomgeving</h1>
        <p>
          Bekijk de leesprofielen en leeslijsten van
          studenten die aan jou gekoppeld zijn.
        </p>
      </header>

      {loading ? (
        <div role="status">
          <p>Gekoppelde studenten laden...</p>

          <div
            className="catalog-grid"
            aria-hidden="true"
          >
            {[1, 2, 3].map((index) => (
              <div className="book-card" key={index}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
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
      ) : students.length === 0 ? (
        <div className="catalog-message">
          <h2>Geen gekoppelde studenten</h2>

          <p>
            Je hebt momenteel geen gekoppelde studenten
            met een ingevuld leesprofiel.
          </p>

          <p>
            Studenten kunnen zichzelf via hun
            leesprofielpagina aan jou koppelen.
          </p>
        </div>
      ) : (
        <section aria-labelledby="students-heading">
          <h2 id="students-heading">
            Mijn studenten
          </h2>

          <p role="status">
            {students.length} gekoppelde{" "}
            {students.length === 1
              ? "student"
              : "studenten"}
          </p>

          <ul className="teacher-student-grid">
            {students.map((student) => (
              <li key={student.id}>
                <article className="teacher-student-card">
                  <h3>{student.name}</h3>

                  <p>{student.email}</p>

                  <Link
                    href={`/docent/studenten/${student.id}`}
                    className="primary-button button-link"
                    aria-label={`Bekijk leesprofiel en leeslijst van ${student.name}`}
                  >
                    Bekijk student
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
