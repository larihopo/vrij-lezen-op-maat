import {
  findProfileByUserId,
} from "../repositories/profile.repository.js";

import {
  findBooksForRecommendations,
} from "../repositories/recommendation.repository.js";

import {
  recommendBooks,
} from "./recommendation.service.js";

export async function getAdviceForStudent(userId: number) {
  // 1. Leesprofiel uit PostgreSQL ophalen
  const profile = await findProfileByUserId(userId);

  if (!profile) {
    return null;
  }

  // 2. Bestaande boeken uit MongoDB ophalen
  const books = await findBooksForRecommendations();

  // 3. De drie beste matches berekenen
  return recommendBooks(profile, books);
}
