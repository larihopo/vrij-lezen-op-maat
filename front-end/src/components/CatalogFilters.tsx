import type {
  CatalogFiltersState,
  CatalogFilterOptions,
} from "@/lib/catalog";

type CatalogFiltersProps = {
  filters: CatalogFiltersState;
  options: CatalogFilterOptions;
  onChange: (
    field: keyof CatalogFiltersState,
    value: string
  ) => void;
  onReset: () => void;
};

export default function CatalogFilters({
  filters,
  options,
  onChange,
  onReset,
}: CatalogFiltersProps) {
  const fields: {
    key: keyof CatalogFiltersState;
    label: string;
    values: string[];
  }[] = [
    {
      key: "niveau",
      label: "Leesniveau",
      values: options.niveaus,
    },
    {
      key: "genre",
      label: "Genre",
      values: options.genres,
    },
    {
      key: "onderwerp",
      label: "Onderwerp",
      values: options.onderwerpen,
    },
    {
      key: "lengte",
      label: "Lengte",
      values: options.lengtes,
    },
  ];

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== ""
  );

  return (
    <section className="catalog-filters" aria-labelledby="filters-title">
      <div className="catalog-filters__heading">
        <h2 id="filters-title">Filter boeken</h2>

        <button
          type="button"
          className="pagination-button"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          Filters wissen
        </button>
      </div>

      <div className="catalog-filters__grid">
        {fields.map((field) => (
          <div className="form-field" key={field.key}>
            <label htmlFor={`filter-${field.key}`}>
              {field.label}
            </label>

            <select
              id={`filter-${field.key}`}
              value={filters[field.key]}
              disabled={field.values.length === 0}
              onChange={(event) =>
                onChange(field.key, event.target.value)
              }
            >
              <option value="">
                {field.values.length === 0
                  ? "Nog niet beschikbaar"
                  : "Alle"}
              </option>

              {field.values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {(options.genres.length === 0 ||
        options.lengtes.length === 0) && (
        <p className="catalog-filters__note">
          Sommige filters zijn nog niet beschikbaar omdat
          de bijbehorende metadata ontbreekt in de catalogus.
        </p>
      )}
    </section>
  );
}
