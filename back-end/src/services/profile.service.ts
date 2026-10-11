import {
  findProfileByUserId,
  upsertProfile,
} from "../repositories/profile.repository.js";

import type { ReadingProfileInput } from "../types/reading-profile.js";

export async function getStudentProfile(userId: number) {
  return findProfileByUserId(userId);
}

export async function saveStudentProfile(
  userId: number,
  input: ReadingProfileInput
) {
  const cleanedProfile: ReadingProfileInput = {
    niveau: input.niveau.trim(),
    genre: input.genre.trim(),
    onderwerp: input.onderwerp.trim(),
    lengte: input.lengte.trim(),
    leesdoel: input.leesdoel.trim(),
  };

  return upsertProfile(userId, cleanedProfile);
}
