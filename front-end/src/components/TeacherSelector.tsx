"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  fetchTeachers,
  fetchTeacherLink,
  saveTeacherLink,
  type Teacher,
  type TeacherLink,
} from "@/lib/teachers";

export default function TeacherSelector() {
  const { session } = useAuth();
  const token = session?.token;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [linkedTeacher, setLinkedTeacher] =
    useState<TeacherLink | null>(null);

  const [selectedId, setSelectedId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    let active = true;

    async function loadTeachers() {
      setLoading(true);
      setError("");

      try {
        const [availableTeachers, currentLink] =
          await Promise.all([
            fetchTeachers(token!, controller.signal),
            fetchTeacherLink(token!, controller.signal),
          ]);

        if (!active) return;

        setTeachers(availableTeachers);
        setLinkedTeacher(currentLink);

        if (currentLink) {
          setSelectedId(String(currentLink.teacherId));
        } else {
          setSelectedId("");
        }
      } catch {
        if (active) {
          setError(
            "De docentgegevens konden niet worden geladen."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadTeachers();

    return () => {
      active = false;
      controller.abort();
    };
  }, [token, retry]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!token || !selectedId) {
      setError("Selecteer eerst een docent.");
      return;
    }

    const teacherId = Number(selectedId);

    if (
      !teachers.some((teacher) => teacher.id === teacherId)
    ) {
      setError("Selecteer een geldige docent.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const link = await saveTeacherLink(
        token,
        teacherId
      );

      setLinkedTeacher(link);

      setMessage(
        "Je bent succesvol gekoppeld aan de docent!"
      );
    } catch {
      setError(
        "Het koppelen is mislukt. Probeer het opnieuw."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p role="status">Docenten laden...</p>;
  }

  if (error && teachers.length === 0) {
    return (
      <div className="catalog-message" role="alert">
        <p>{error}</p>

        <button
          type="button"
          className="pagination-button"
          onClick={() => setRetry((n) => n + 1)}
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  return (
    <div className="teacher-link-panel">
      <h2>Mijn docent</h2>

      {linkedTeacher ? (
        <p>
          Je bent gekoppeld aan:{" "}
          <strong>{linkedTeacher.teacherName}</strong>
        </p>
      ) : (
        <p>Je hebt nog geen docent gekoppeld.</p>
      )}

      {teachers.length === 0 ? (
        <p>Er zijn momenteel geen docenten beschikbaar.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="teacher-select">
              Kies je docent
            </label>

            <select
              id="teacher-select"
              value={selectedId}
              onChange={(event) => {
                setSelectedId(event.target.value);
                setMessage("");
                setError("");
              }}
              required
              disabled={saving}
            >
              <option value="">Selecteer een docent</option>

              {teachers.map((teacher) => (
                <option
                  key={teacher.id}
                  value={teacher.id}
                >
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={
              saving ||
              !selectedId ||
              Number(selectedId) === linkedTeacher?.teacherId
            }
          >
            {saving
              ? "Koppelen..."
              : linkedTeacher
                ? "Docent wijzigen"
                : "Docent koppelen"}
          </button>
        </form>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
