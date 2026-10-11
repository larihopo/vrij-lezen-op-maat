"use client";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  addBookToReadingList,
  ReadingListApiError,
} from "@/lib/reading-list";

type Props = {
  bookId: string;
};

export default function AddToReadingListButton({
  bookId,
}: Props) {
  const { session } = useAuth();

  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Alleen studenten kunnen boeken toevoegen
  if (!session || session.user.role !== "student") {
    return null;
  }

  async function handleAdd() {
    if (!session || loading || added) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await addBookToReadingList(
        session.token,
        bookId
      );

      setAdded(true);
      setMessage("Toegevoegd aan je leeslijst!");
    } catch (err) {
      if (
        err instanceof ReadingListApiError &&
        err.status === 409
      ) {
        setAdded(true);
        setMessage("Dit boek staat al op je leeslijst.");
      } else if (
        err instanceof ReadingListApiError &&
        err.status === 401
      ) {
        setError("Je sessie is verlopen. Log opnieuw in.");
      } else {
        setError(
          "Toevoegen mislukt. Controleer je verbinding."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="book-card__add-action">
      <button
        type="button"
        className="primary-button"
        onClick={handleAdd}
        disabled={loading || added}
      >
        {loading
          ? "Toevoegen..."
          : added
            ? "Op leeslijst"
            : "Toevoegen aan mijn leeslijst"}
      </button>

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
    </div>
  );
}
