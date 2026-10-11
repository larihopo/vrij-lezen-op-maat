import { describe, expect, it } from "vitest";

import {
  recommendBooks,
  type RecommendationBook,
} from "./recommendation.service.js";

import type { ReadingProfileInput } from "../types/reading-profile.js";

const profile: ReadingProfileInput = {
  niveau: "Makkelijk",
  genre: "Spanning",
  onderwerp: "Games",
  lengte: "Middel",
  leesdoel: "Nieuwe werelden ontdekken",
};

function makeBook(
  overrides: Partial<RecommendationBook>
): RecommendationBook {
  return {
    id: "1",
    title: "Voorbeeldboek",
    description: "Een korte beschrijving.",
    readingLevel: "2F",
    genre: null,
    topics: [],
    length: null,
    materialType: "Boek",
    ...overrides,
  };
}

describe("recommendBooks", () => {
  it("geeft de drie best passende boeken terug", () => {
    const books = [
      makeBook({
        id: "1",
        title: "Boek A",
        readingLevel: "3F+",
      }),
      makeBook({
        id: "2",
        title: "Boek B",
        materialType: "Boek - thriller",
      }),
      makeBook({
        id: "3",
        title: "Boek C",
        topics: ["Games"],
        materialType: "Boek - thriller",
      }),
      makeBook({
        id: "4",
        title: "Boek D",
      }),
    ];

    const result = recommendBooks(profile, books);

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe("Boek C");
    expect(result[1].title).toBe("Boek B");
    expect(result[0].score).toBeGreaterThan(
      result[1].score
    );
  });

  it("geeft een lege lijst bij een lege catalogus", () => {
    const result = recommendBooks(profile, []);

    expect(result).toEqual([]);
  });

  it("verzint geen titels als er minder dan drie zijn", () => {
    const books = [
      makeBook({
        id: "1",
        title: "Enig boek",
      }),
    ];

    const result = recommendBooks(profile, books);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Enig boek");
  });

  it("geeft geen punten voor ontbrekende lengte", () => {
    const books = [
      makeBook({
        id: "1",
        title: "Boek zonder lengte",
        readingLevel: null,
      }),
    ];

    const result = recommendBooks(profile, books);

    expect(result[0].score).toBe(0);
  });

  it("geeft lengtepunten voor korte teksten", () => {
    const shortProfile: ReadingProfileInput = {
      ...profile,
      lengte: "Korte verhalen of teksten",
    };

    const books = [
      makeBook({
        id: "1",
        title: "Kort boek",
        readingLevel: null,
        genre: null,
        topics: [],
        length: "Korte verhalen of teksten",
        materialType: "Boek",
      }),
    ];

    const result = recommendBooks(shortProfile, books);

    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(1);
    expect(result[0].reason).toContain(
      "De lengte past bij jouw voorkeur."
    );
  });

});
