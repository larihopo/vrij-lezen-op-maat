import {
  findCatalogBooks,
  findCatalogFilters,
} from "../repositories/catalog.repository.js";

export type CatalogQueryParams = {
  page?: number;
  limit?: number;
  niveau?: string;
  genre?: string;
  onderwerp?: string;
  lengte?: string;
};

export async function getCatalogPage(
  params: CatalogQueryParams
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 9;

  const { items, total } = await findCatalogBooks({
    ...params,
    page,
    limit,
  });

  return {
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCatalogFilters() {
  return findCatalogFilters();
}
