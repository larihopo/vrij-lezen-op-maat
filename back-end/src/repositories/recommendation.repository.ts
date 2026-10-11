import { getBooksCollection } from "../db/mongo.js";

import type {
  RecommendationBook,
} from "../services/recommendation.service.js";

export async function findBooksForRecommendations(): Promise<
  RecommendationBook[]
> {
  const collection = getBooksCollection();

  const books = await collection
    .find(
      {},
      {
        projection: {
          title: 1,
          description: 1,
          readingLevel: 1,
          genre: 1,
          topics: 1,
          length: 1,
          materialType: 1,
        },
      }
    )
    .toArray();

  return books.map((book) => ({
    id: book._id,
    title: book.title,
    description: book.description ?? "",
    readingLevel: book.readingLevel ?? null,
    genre: book.genre ?? null,
    topics: Array.isArray(book.topics) ? book.topics : [],
    length: book.length ?? null,
    materialType: book.materialType ?? null,
  }));
}
