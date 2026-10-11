import "dotenv/config";
import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  throw new Error("MONGODB_URL ontbreekt in .env");
}

export type CatalogBook = {
  _id: string;
  sourceRow: number;
  title: string;
  author: string | null;
  description: string;
  materialType: string | null;
  readingLevel: string | null;
  topics: string[];
  sourceUrl: string | null;
  rawThemeField: string | null;
  genre: string | null;
  length: string | null;
};

export const mongoClient = new MongoClient(mongoUrl);

export function getBooksCollection() {
  return mongoClient
    .db("vrijlezen_catalogus")
    .collection<CatalogBook>("books");
}
