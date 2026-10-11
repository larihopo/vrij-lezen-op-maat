"use client";

import { useEffect, useState } from "react";

import BookCard from "@/components/BookCard";
import CatalogFilters from "@/components/CatalogFilters";

import {
  fetchCatalogPage,
  fetchCatalogFilters,
  emptyCatalogFilters,
  type CatalogResponse,
  type CatalogFiltersState,
  type CatalogFilterOptions,
} from "@/lib/catalog";

export default function CatalogusPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CatalogFiltersState>(
    emptyCatalogFilters
  );

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [filterOptions, setFilterOptions] =
    useState<CatalogFilterOptions | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [retry, setRetry] = useState(0);
  const [filterRetry, setFilterRetry] = useState(0);

  // Haal de beschikbare filteropties op
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadFilters() {
      setFilterError("");

      try {
        const result = await fetchCatalogFilters(
          controller.signal
        );

        if (active) {
          setFilterOptions(result);
        }
      } catch {
        if (active) {
          setFilterError(
            "De filteropties konden niet worden geladen."
          );
        }
      }
    }

    void loadFilters();

    return () => {
      active = false;
      controller.abort();
    };
  }, [filterRetry]);

  // Haal boeken op wanneer pagina of filters veranderen
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadBooks() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchCatalogPage(
          page,
          filters,
          controller.signal
        );

        if (active) {
          setCatalog(result);
        }
      } catch {
        if (active) {
          setCatalog(null);
          setError(
            "Boeken ophalen is mislukt. Controleer of de server draait."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBooks();

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, filters, retry]);

  function handleFilterChange(
    field: keyof CatalogFiltersState,
    value: string
  ) {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));

    setPage(1);
  }

  function handleResetFilters() {
    setFilters(emptyCatalogFilters);
    setPage(1);
  }

  return (
    <main className="container">
      <header className="catalog-header">
        <h1>Boekencatalogus</h1>
        <p>
          Ontdek boeken en teksten uit onze leescatalogus.
          Gebruik de filters om gericht te zoeken.
        </p>
      </header>

      {filterOptions && (
        <CatalogFilters
          filters={filters}
          options={filterOptions}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}

      {!filterOptions && !filterError && (
        <p role="status">Filteropties laden...</p>
      )}

      {filterError && (
        <div className="catalog-message" role="alert">
          <p>{filterError}</p>
          <button
            type="button"
            className="pagination-button"
            onClick={() => setFilterRetry((n) => n + 1)}
          >
            Filters opnieuw laden
          </button>
        </div>
      )}

      {loading ? (
        <div role="status">
          <p>Boeken worden geladen...</p>

          <div className="catalog-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                className="book-card book-card--skeleton"
                key={index}
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
          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => setRetry((n) => n + 1)}
          >
            Opnieuw proberen
          </button>
        </div>
      ) : catalog ? (
        <>
          <p className="catalog-count" role="status">
            {catalog.total} resultaten gevonden.
          </p>

          {catalog.items.length === 0 ? (
            <div className="catalog-message">
              <p>Geen boeken gevonden met deze filters.</p>
              <button
                type="button"
                className="pagination-button"
                onClick={handleResetFilters}
              >
                Filters wissen
              </button>
            </div>
          ) : (
            <div className="catalog-grid">
              {catalog.items.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {catalog.totalPages > 1 && (
            <nav
              className="pagination"
              aria-label="Paginering catalogus"
            >
              <button
                type="button"
                className="pagination-button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Vorige
              </button>

              <span aria-live="polite">
                Pagina {catalog.page} van {catalog.totalPages}
              </span>

              <button
                type="button"
                className="pagination-button"
                disabled={page >= catalog.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Volgende
              </button>
            </nav>
          )}
        </>
      ) : null}
    </main>
  );
}
