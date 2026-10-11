import "dotenv/config";

import {
  mongoClient,
  getBooksCollection,
} from "./mongo.js";

type Genre =
  | "Spanning"
  | "Humor"
  | "Liefde"
  | "Vriendschap"
  | "Oorlog"
  | "Gedichtenbundel";

const materialGenres: Record<string, Genre> = {
  "boek - thriller": "Spanning",
  dichtbundel: "Gedichtenbundel",
};

const topicGenres: Record<string, Genre> = {
  spanning: "Spanning",
  thriller: "Spanning",
  detective: "Spanning",
  mysterie: "Spanning",
  humor: "Humor",
  liefde: "Liefde",
  vriendschap: "Vriendschap",
  oorlog: "Oorlog",
  woii: "Oorlog",
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("nl");
}

async function main() {
  const apply = process.argv.includes("--apply");

  await mongoClient.connect();

  try {
    const collection = getBooksCollection();
    const books = await collection.find({}).toArray();

    const changes: {
      id: string;
      title: string;
      genre: Genre;
      source: string;
    }[] = [];

    const conflicts: string[] = [];
    let alreadyFilled = 0;

    for (const book of books) {
      // Bestaande genregegevens nooit overschrijven
      if (book.genre?.trim()) {
        alreadyFilled++;
        continue;
      }

      // Eerst de expliciete materiaalaanduiding
      const materialGenre =
        materialGenres[normalize(book.materialType)];

      if (materialGenre) {
        changes.push({
          id: book._id,
          title: book.title,
          genre: materialGenre,
          source: "materiaaltype",
        });

        continue;
      }

      // Daarna rechtstreeks overeenkomende onderwerpen
      const matches = new Set<Genre>();

      for (const topic of book.topics ?? []) {
        const genre = topicGenres[normalize(topic)];

        if (genre) {
          matches.add(genre);
        }
      }

      const matchedGenres = [...matches];

      if (matchedGenres.length === 1) {
        changes.push({
          id: book._id,
          title: book.title,
          genre: matchedGenres[0],
          source: "onderwerp",
        });
      } else if (matchedGenres.length > 1) {
        conflicts.push(
          `${book.title}: ${matchedGenres.join(", ")}`
        );
      }
    }

    console.log(`\nBoeken gecontroleerd: ${books.length}`);
    console.log(`Genres al ingevuld: ${alreadyFilled}`);
    console.log(`Automatisch in te vullen: ${changes.length}`);
    console.log(`Meerdere mogelijke categorieën: ${conflicts.length}`);

    console.log("\nVoorgestelde verdeling:");

    for (const genre of [
      "Spanning",
      "Humor",
      "Liefde",
      "Vriendschap",
      "Oorlog",
      "Gedichtenbundel",
    ] as Genre[]) {
      const count = changes.filter(
        (change) => change.genre === genre
      ).length;

      console.log(`  ${genre}: ${count}`);
    }

    if (conflicts.length > 0) {
      console.log("\nVoorbeelden ter controle:");

      for (const conflict of conflicts.slice(0, 10)) {
        console.log(`  - ${conflict}`);
      }
    }

    if (!apply) {
      console.log(
        "\nCONTROLEMODUS: database niet gewijzigd."
      );
      console.log(
        "Gebruik --apply om de voorgestelde genres op te slaan."
      );
      return;
    }

    if (changes.length === 0) {
      console.log("\nGeen wijzigingen nodig.");
      return;
    }

    const result = await collection.bulkWrite(
      changes.map((change) => ({
        updateOne: {
          filter: {
            _id: change.id,
            genre: { $in: [null, ""] },
          },
          update: {
            $set: {
              genre: change.genre,
            },
          },
        },
      }))
    );

    console.log(
      `\nGenres bijgewerkt: ${result.modifiedCount}`
    );
  } finally {
    await mongoClient.close();
  }
}

main().catch((error) => {
  console.error("Verrijking mislukt:", error);
  process.exitCode = 1;
});
