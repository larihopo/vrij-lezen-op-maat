import "dotenv/config";

import {
  mongoClient,
  getBooksCollection,
} from "./mongo.js";

const verifiedBooks = [
  {
    id: "excel-11",
    title: "De val",
    pages: 92,
    source:
      "https://www.bibliotheek.nl/catalogus/titel.421393890.html/de-val/",
  },
  {
    id: "excel-54",
    title: "Blauwe plekken",
    pages: 179,
    source:
      "https://www.bibliotheek.nl/catalogus/titel.448290944.html/blauwe-plekken/",
  },
  {
    id: "excel-47",
    title: "De jongen in de gestreepte pyjama",
    pages: 210,
    source:
      "https://www.lannoo.com/nl-nl/de-jongen-de-gestreepte-pyjama-9789022568705",
  },
  {
    id: "excel-20",
    title: "Het Rosieproject",
    pages: 336,
    source:
      "https://www.rainbow.nl/boek/2985/graeme-simsion-het-rosie-project.html",
  },
];

function classifyLength(pages: number): string {
  if (pages <= 150) {
    return "Korte verhalen of teksten";
  }

  if (pages <= 300) {
    return "Middel";
  }

  return "Lang";
}

async function main() {
  const apply = process.argv.includes("--apply");

  await mongoClient.connect();

  try {
    const collection = getBooksCollection();

    for (const entry of verifiedBooks) {
      const book = await collection.findOne({
        _id: entry.id,
      });

      if (!book || book.title !== entry.title) {
        console.log(
          `OVERGESLAGEN: ${entry.title} — titel of ID klopt niet.`
        );
        continue;
      }

      const category = classifyLength(entry.pages);

      if (book.length?.trim()) {
        console.log(
          `AL INGEVULD: ${book.title} — ${book.length}`
        );
        continue;
      }

      console.log(
        `${apply ? "OPSLAAN" : "VOORSTEL"}: ` +
          `${book.title} (${entry.pages} pagina's) ` +
          `→ ${category}`
      );

      if (apply) {
        await collection.updateOne(
          {
            _id: entry.id,
            length: null,
          },
          {
            $set: { length: category },
          }
        );
      }
    }

    console.log(
      apply
        ? "\nVerrijking afgerond."
        : "\nCONTROLEMODUS: geen databasewijzigingen."
    );
  } finally {
    await mongoClient.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
