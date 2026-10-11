
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { API_BASE_URL } from "@/lib/api";

import {
  addBookForTeacherStudent,
  TeacherDashboardApiError,
} from "@/lib/teacher-dashboard";

type CatalogOption = {
  id: string;
  title: string;
  author: string | null;
};

type CatalogPage = {
  items: CatalogOption[];
  total: number;
};

type Props = {
  token: string;
  studentId: number;
  onAdded: () => void;
};

const PAGE_SIZE = 30;
const MAX_RESULTS = 8;

export default function TeacherBookPicker({
  token,
  studentId,
  onAdded,
}: Props) {
  const [books, setBooks] = useState<CatalogOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [catalogError, setCatalogError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [retry, setRetry] = useState(0);

  // Alle cataloguspagina's automatisch ophalen
  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      setLoading(true);
      setCatalogError("");

      try {
        const allBooks: CatalogOption[] = [];
        let page = 1;
        let total = Infinity;

        while (allBooks.length < total) {
          const response = await fetch(
            `${API_BASE_URL}/api/catalog?page=${page}&limit=${PAGE_SIZE}`,
            {
              signal: controller.signal,
              cache: "no-store",
            }
          );

          if (!response.ok) {
            throw new Error("Catalogus niet beschikbaar");
          }

          const data =
            (await response.json()) as CatalogPage;

          total = data.total;

          if (data.items.length === 0) {
            break;
          }

          allBooks.push(...data.items);
          page++;
        }

        if (!controller.signal.aborted) {
          setBooks(allBooks);
        }
      } catch {
        if (!controller.signal.aborted) {
          setBooks([]);
          setCatalogError(
            "De catalogus kon niet worden geladen."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadBooks();

    return () => controller.abort();
  }, [retry]);

  // Zoek op titel of auteur
  const searchTerm = search.trim().toLocaleLowerCase("nl");

  const matchingBooks = searchTerm
    ? books.filter((book) => {
        const title = book.title.toLocaleLowerCase("nl");
        const author = (book.author ?? "")
          .toLocaleLowerCase("nl");

        return (
          title.includes(searchTerm) ||
          author.includes(searchTerm)
        );
      })
    : [];

  const visibleBooks = matchingBooks.slice(0, MAX_RESULTS);

  const selectedBook = books.find(
    (book) => book.id === selectedBookId
  );

  function selectBook(book: CatalogOption) {
    setSelectedBookId(book.id);
    setSearch(book.title);
    setShowResults(false);
    setActionError("");
    setSuccess("");
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setSelectedBookId("");
    setShowResults(true);
    setActionError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedBookId || saving || loading) {
      return;
    }

    setSaving(true);
    setActionError("");
    setSuccess("");

    try {
      await addBookForTeacherStudent(
        token,
        studentId,
        selectedBookId
      );

      setSelectedBookId("");
      setSearch("");
      setShowResults(false);

      setSuccess(
        "Het boek is toegevoegd aan de leeslijst."
      );

      // Studentdetailpagina haalt de leeslijst opnieuw op
      onAdded();
    } catch (err) {
      if (err instanceof TeacherDashboardApiError) {
        if (err.status === 409) {
          setActionError(
            "Dit boek staat al op de leeslijst."
          );
        } else if (err.status === 404) {
          setActionError(
            "Het boek bestaat niet meer of de student " +
              "is niet langer aan jou gekoppeld."
          );
        } else if (err.status === 401) {
          setActionError(
            "Je sessie is verlopen. Log opnieuw in."
          );
        } else if (err.status === 403) {
          setActionError(
            "Je hebt geen toestemming om dit boek toe te voegen."
          );
        } else {
          setActionError(
            "Het toevoegen is mislukt. Probeer opnieuw."
          );
        }
      } else {
        setActionError(
          "De server is niet bereikbaar. Probeer opnieuw."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  const resultsOpen =
    showResults &&
    !selectedBookId &&
    searchTerm.length > 0 &&
    !loading &&
    !catalogError;

  return (
    <section className="teacher-book-picker">
      <h3>Boek toevoegen voor deze student</h3>

      <p>
        Zoek op titel of auteur en selecteer een boek
        uit de catalogus.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className="teacher-book-search"
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(
                event.relatedTarget as Node | null
              )
            ) {
              setShowResults(false);
            }
          }}
        >
          <label htmlFor="teacher-book-search-input">
            Zoek een boek
          </label>

          <input
            id="teacher-book-search-input"
            type="search"
            placeholder="Typ een titel of auteur..."
            value={search}
            onChange={(event) =>
              handleSearchChange(event.target.value)
            }
            onFocus={() => {
              if (!selectedBookId) {
                setShowResults(true);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setShowResults(false);
              }
            }}
            disabled={loading || saving || Boolean(catalogError)}
            autoComplete="off"
            aria-describedby="teacher-book-search-help"
          />

          <p
            id="teacher-book-search-help"
            className="teacher-book-help"
          >
            {loading
              ? "Catalogus laden..."
              : `${books.length} boeken beschikbaar. Zoek en klik op een resultaat.`}
          </p>

          {resultsOpen && (
            <div className="teacher-book-results">
              {matchingBooks.length === 0 ? (
                <p className="teacher-book-empty">
                  Geen boeken gevonden voor: {search}.
                </p>
              ) : (
                <>
                  <p
                    className="teacher-book-result-count"
                    role="status"
                  >
                    {matchingBooks.length} resultaten
                    {matchingBooks.length > MAX_RESULTS
                      ? ` — eerste ${MAX_RESULTS} getoond. Typ meer om te verfijnen.`
                      : ""}
                  </p>

                  <ul>
                    {visibleBooks.map((book) => (
                      <li key={book.id}>
                        <button
                          type="button"
                          className="teacher-book-result"
                          onClick={() => selectBook(book)}
                        >
                          <strong>{book.title}</strong>

                          {book.author && (
                            <span>{book.author}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {selectedBook && (
          <div
            className="teacher-book-selected"
            role="status"
          >
            <p>
              <strong>Geselecteerd boek:</strong>{" "}
              {selectedBook.title}
            </p>

            <button
              type="button"
              className="pagination-button"
              onClick={() => {
                setSelectedBookId("");
                setSearch("");
                setShowResults(false);
              }}
              disabled={saving}
            >
              Andere titel kiezen
            </button>
          </div>
        )}

        {catalogError && (
          <div role="alert">
            <p className="error-message">
              {catalogError}
            </p>

            <button
              type="button"
              className="pagination-button"
              onClick={() =>
                setRetry((previous) => previous + 1)
              }
            >
              Opnieuw proberen
            </button>
          </div>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={
            !selectedBookId ||
            loading ||
            saving ||
            Boolean(catalogError)
          }
        >
          {saving
            ? "Boek toevoegen..."
            : "Toevoegen aan leeslijst"}
        </button>
      </form>

      {actionError && (
        <p className="error-message" role="alert">
          {actionError}
        </p>
      )}

      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}
    </section>
  );
}
