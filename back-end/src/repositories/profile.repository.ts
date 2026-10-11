import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { readingProfiles } from "../db/schema.js";
import type { ReadingProfileInput } from "../types/reading-profile.js";

export async function findProfileByUserId(userId: number) {
  const [profile] = await db
    .select()
    .from(readingProfiles)
    .where(eq(readingProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function upsertProfile(
  userId: number,
  data: ReadingProfileInput
) {
  const [profile] = await db
    .insert(readingProfiles)
    .values({
      userId,
      ...data,
    })
    .onConflictDoUpdate({
      target: readingProfiles.userId,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning();

  return profile;
}
