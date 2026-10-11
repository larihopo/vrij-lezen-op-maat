import { API_BASE_URL } from "./api";
import type { CatalogBook } from "./catalog";

export type AdviceBook = Omit<CatalogBook, "author"> & {
  score: number;
  reason: string;
};

export type AdviceResponse = {
  items: AdviceBook[];
  total: number;
};

export class AdviceRequestError extends Error {
  constructor(public status: number) {
    super("Het ophalen van leesadvies is mislukt.");
    this.name = "AdviceRequestError";
  }
}

export async function fetchAdvice(
  token: string,
  signal?: AbortSignal
): Promise<AdviceResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/advies`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new AdviceRequestError(response.status);
  }

  return (await response.json()) as AdviceResponse;
}
