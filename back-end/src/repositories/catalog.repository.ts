import type { Filter } from "mongodb";
import {
  getBooksCollection,
  type CatalogBook,
} from "../db/mongo.js";

export type CatalogQuery = {
  page: number;
  limit: number;
  niveau?: string;
  genre?: string;
  onderwerp?: string;
  lengte?: string;
};

export async function findCatalogBooks(query: CatalogQuery) {
  const collection = getBooksCollection();

  const filter: Filter<CatalogBook> = {};

  if (query.niveau) {
    filter.readingLevel = query.niveau;
  }

  if (query.genre) {
    filter.genre = query.genre;
  }

  if (query.onderwerp) {
    filter.topics = query.onderwerp;
  }

  if (query.lengte) {
    filter.length = query.lengte;
  }

  const skip = (query.page - 1) * query.limit;

  const [total, documents] = await Promise.all([
    collection.countDocuments(filter),
    collection
      .find(filter)
      .sort({ title: 1, _id: 1 })
      .skip(skip)
      .limit(query.limit)
      .toArray(),
  ]);

  const items = documents.map((book) => ({
    id: book._id,
    title: book.title,
    author: book.author,
    description: book.description,
    materialType: book.materialType,
    readingLevel: book.readingLevel,
    topics: book.topics,
    genre: book.genre,
    length: book.length,
  }));

  return { items, total };
}

export async function findCatalogFilters() {
  const collection = getBooksCollection();

  const [niveaus, genres, onderwerpen, lengtes] =
    await Promise.all([
      collection.distinct("readingLevel"),
      collection.distinct("genre"),
      collection.distinct("topics"),
      collection.distinct("length"),
    ]);

  return {
    niveaus: niveaus.filter(Boolean).sort(),
    genres: genres.filter(Boolean).sort(),
    onderwerpen: onderwerpen.filter(Boolean).sort(),
    lengtes: lengtes.filter(Boolean).sort(),
  };
}
