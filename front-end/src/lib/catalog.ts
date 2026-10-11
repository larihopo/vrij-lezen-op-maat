import { API_BASE_URL } from "./api";

export type CatalogBook = {
  id: string;
  title: string;
  author: string | null;
  description: string;
  materialType: string | null;
  readingLevel: string | null;
  topics: string[];
  genre: string | null;
  length: string | null;
};

export type CatalogResponse = {
  items: CatalogBook[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};


export type CatalogFiltersState = {
  niveau: string;
  genre: string;
  onderwerp: string;
  lengte: string;
};

export type CatalogFilterOptions = {
  niveaus: string[];
  genres: string[];
  onderwerpen: string[];
  lengtes: string[];
};

export const emptyCatalogFilters: CatalogFiltersState = {
  niveau: "",
  genre: "",
  onderwerp: "",
  lengte: "",
};

export async function fetchCatalogPage(
  page: number,
  filters: CatalogFiltersState,
  signal?: AbortSignal
): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: "9",
  });

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const response = await fetch(
    `${API_BASE_URL}/api/catalog?${params.toString()}`,
    {
      signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("De catalogus kon niet worden opgehaald.");
  }

  return (await response.json()) as CatalogResponse;
}

export async function fetchCatalogFilters(
  signal?: AbortSignal
): Promise<CatalogFilterOptions> {
  const response = await fetch(
    `${API_BASE_URL}/api/catalog/filters`,
    {
      signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Filteropties konden niet worden opgehaald.");
  }

  return (await response.json()) as CatalogFilterOptions;
}


