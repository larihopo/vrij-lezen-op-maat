import { readFile } from "node:fs/promises";
import {
  mongoClient,
  getBooksCollection,
  type CatalogBook,
} from "./mongo.js";

async function importCatalog() {
  try {
    const fileUrl = new URL(
      "../../data/catalog.json",
      import.meta.url
    );

    const content = await readFile(fileUrl, "utf8");
    const books: CatalogBook[] = JSON.parse(content);

    if (
      !Array.isArray(books) ||
      books.some(
        (book) =>
          typeof book._id !== "string" ||
          typeof book.title !== "string" ||
          typeof book.description !== "string"
      )
    ) {
      throw new Error("Het catalogusbestand is ongeldig.");
    }

    await mongoClient.connect();

    const collection = getBooksCollection();

    if (books.length === 0) {
      throw new Error("De catalogus is leeg.");
    }

    // Bestaande documenten bijwerken,
    // nieuwe documenten toevoegen.
    await collection.bulkWrite(
      books.map((book) => {
        const { _id, ...data } = book;

        return {
          updateOne: {
            filter: { _id },
            update: { $set: data },
            upsert: true,
          },
        };
      })
    );

    // Indexen voor toekomstige zoek- en filterqueries
    await collection.createIndex({ title: 1 });
    await collection.createIndex({ readingLevel: 1 });
    await collection.createIndex({ topics: 1 });

    const total = await collection.countDocuments();

    console.log(`Import voltooid: ${books.length} titels verwerkt.`);
    console.log(`Totaal documenten in MongoDB: ${total}`);
  } finally {
    await mongoClient.close();
  }
}

importCatalog().catch((error) => {
  console.error("Import mislukt:", error);
  process.exitCode = 1;
});
