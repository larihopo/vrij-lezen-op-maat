export type ReadingProfile = {
  niveau: string;
  genre: string;
  onderwerp: string;
  lengte: string;
  leesdoel: string;
};

export const emptyProfile: ReadingProfile = {
  niveau: "",
  genre: "",
  onderwerp: "",
  lengte: "",
  leesdoel: "",
};

export const profileKeys: (keyof ReadingProfile)[] = [
  "niveau",
  "genre",
  "onderwerp",
  "lengte",
  "leesdoel",
];

export function pickProfile(
  profile: ReadingProfile
): ReadingProfile {
  return {
    niveau: profile.niveau,
    genre: profile.genre,
    onderwerp: profile.onderwerp,
    lengte: profile.lengte,
    leesdoel: profile.leesdoel,
  };
}

export function isReadingProfile(
  value: unknown
): value is ReadingProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return profileKeys.every(
    (key) => typeof data[key] === "string"
  );
}
