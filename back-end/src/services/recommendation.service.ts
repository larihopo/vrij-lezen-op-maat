import type { ReadingProfileInput } from "../types/reading-profile.js";

export type RecommendationBook = {
  id: string;
  title: string;
  description: string;
  readingLevel: string | null;
  genre: string | null;
  topics: string[];
  length: string | null;
  materialType: string | null;
};

export type Recommendation = RecommendationBook & {
  score: number;
  reason: string;
};

const levelMapping: Record<string, string[]> = {
  Makkelijk: ["2F", "2F-3F"],
  Gemiddeld: ["2F-3F", "3F"],
  Uitdagend: ["3F", "3F+"],
};

function normalize(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export function recommendBooks(
  profile: ReadingProfileInput,
  books: RecommendationBook[]
): Recommendation[] {
  const recommendations = books
    .filter((book) => book.title && book.description)
    .map((book) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Leesniveau
      const allowedLevels = levelMapping[profile.niveau] ?? [];

      if (
        book.readingLevel &&
        allowedLevels.includes(book.readingLevel)
      ) {
        score += 4;
        reasons.push(
          `Het leesniveau ${book.readingLevel} sluit aan bij jouw gekozen moeilijkheid.`
        );
      }

      // 2. Genre
      const genre = normalize(profile.genre);
      const bookGenre = normalize(book.genre);
      const material = normalize(book.materialType);

      const genreMatches =
        (bookGenre !== "" && bookGenre === genre) ||
        (genre === "spanning" && material.includes("thriller")) ||
        (genre === "gedichtenbundel" &&
          material.includes("dichtbundel"));

      if (genreMatches) {
        score += 3;
        reasons.push(
          `Het materiaal sluit aan bij je voorkeur voor ${profile.genre}.`
        );
      }

      // 3. Onderwerp
      const topicMatches = book.topics.some(
        (topic) =>
          normalize(topic) === normalize(profile.onderwerp)
      );

      if (topicMatches) {
        score += 2;
        reasons.push(
          `Het onderwerp ${profile.onderwerp} komt overeen met jouw interesse.`
        );
      }

      // 4. Lengte
      const desiredLength = normalize(profile.lengte);

      if (
        book.length &&
        normalize(book.length) === desiredLength
      ) {
        score += 1;
        reasons.push("De lengte past bij jouw voorkeur.");
      }

      return {
        ...book,
        score,
        reason:
          reasons.length > 0
            ? reasons.join(" ")
            : "Dit is een aanvullende ontdekkingstip. Er is nog onvoldoende metadata voor een sterke persoonlijke match.",
      };
    });

  // Beste overeenkomsten eerst
  recommendations.sort(
    (a, b) =>
      b.score - a.score ||
      a.title.localeCompare(b.title, "nl")
  );

  // Voorkom meerdere adviezen met dezelfde titel
  const seenTitles = new Set<string>();

  return recommendations
    .filter((book) => {
      const title = normalize(book.title);

      if (seenTitles.has(title)) {
        return false;
      }

      seenTitles.add(title);
      return true;
    })
    .slice(0, 3);
}
