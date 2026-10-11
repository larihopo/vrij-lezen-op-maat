import type { FastifyPluginAsync } from "fastify";

import {
  getStudentProfile,
  saveStudentProfile,
} from "../services/profile.service.js";

import type { ReadingProfileInput } from "../types/reading-profile.js";

// De vijf velden van een leesprofiel.
// Wordt gebruikt om responses te documenteren.
const profileResponseSchema = {
  type: "object",
  required: [
    "niveau",
    "genre",
    "onderwerp",
    "lengte",
    "leesdoel",
  ],
  additionalProperties: true,
  properties: {
    userId: {
      type: "integer",
      description: "ID van de student.",
    },
    niveau: {
      type: "string",
    },
    genre: {
      type: "string",
    },
    onderwerp: {
      type: "string",
    },
    lengte: {
      type: "string",
    },
    leesdoel: {
      type: "string",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
  },
} as const;

// Een student kan nog geen opgeslagen profiel hebben.
const nullableProfileResponseSchema = {
  ...profileResponseSchema,
  nullable: true,
} as const;

// Gedeeld schema voor HTTP-foutmeldingen.
const errorResponseSchema = {
  type: "object",
  required: ["message"],
  additionalProperties: true,
  properties: {
    statusCode: {
      type: "integer",
    },
    error: {
      type: "string",
    },
    message: {
      type: "string",
    },
  },
} as const;

// Bestaande invoervalidatie blijft ongewijzigd.
const profileInputSchema = {
  type: "object",
  required: [
    "niveau",
    "genre",
    "onderwerp",
    "lengte",
    "leesdoel",
  ],
  additionalProperties: false,
  properties: {
    niveau: {
      type: "string",
      minLength: 1,
      maxLength: 50,
      pattern: "\\S",
    },
    genre: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      pattern: "\\S",
    },
    onderwerp: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      pattern: "\\S",
    },
    lengte: {
      type: "string",
      minLength: 1,
      maxLength: 50,
      pattern: "\\S",
    },
    leesdoel: {
      type: "string",
      minLength: 1,
      maxLength: 150,
      pattern: "\\S",
    },
  },
} as const;

export const profileRoutes: FastifyPluginAsync = async (app) => {
  // Alle routes binnen deze plugin zijn alleen voor studenten.
  app.addHook("preHandler", async (request, reply) => {
    await request.jwtVerify();

    if (request.user.role !== "student") {
      return reply.status(403).send({
        message: "Alleen studenten mogen een leesprofiel beheren.",
      });
    }
  });

  // Opgeslagen leesprofiel ophalen
  app.get(
    "/profiel",
    {
      schema: {
        tags: ["Leesprofiel"],
        summary: "Leesprofiel van de ingelogde student ophalen",
        description:
          "Geeft het opgeslagen leesprofiel terug. " +
          "Als nog geen profiel bestaat, is profile null.",

        security: [{ bearerAuth: [] }],

        response: {
          200: {
            description: "Leesprofiel succesvol opgehaald.",
            type: "object",
            required: ["profile"],
            properties: {
              profile: nullableProfileResponseSchema,
            },
          },
          401: {
            description: "Niet ingelogd of ongeldig JWT.",
            ...errorResponseSchema,
          },
          403: {
            description: "Gebruiker is geen student.",
            ...errorResponseSchema,
          },
        },
      },
    },
    async (request) => {
      const profile = await getStudentProfile(
        request.user.userId
      );

      return { profile };
    }
  );

  // Leesprofiel aanmaken of wijzigen
  app.put<{ Body: ReadingProfileInput }>(
    "/profiel",
    {
      schema: {
        tags: ["Leesprofiel"],
        summary: "Leesprofiel opslaan",
        description:
          "Maakt een leesprofiel aan of werkt het " +
          "bestaande profiel van de student bij.",

        security: [{ bearerAuth: [] }],

        body: profileInputSchema,

        response: {
          200: {
            description: "Leesprofiel succesvol opgeslagen.",
            type: "object",
            required: ["message", "profile"],
            properties: {
              message: {
                type: "string",
              },
              profile: profileResponseSchema,
            },
          },
          400: {
            description: "Ongeldige of ontbrekende invoervelden.",
            ...errorResponseSchema,
          },
          401: {
            description: "Niet ingelogd of ongeldig JWT.",
            ...errorResponseSchema,
          },
          403: {
            description: "Gebruiker is geen student.",
            ...errorResponseSchema,
          },
        },
      },
    },
    async (request) => {
      const profile = await saveStudentProfile(
        request.user.userId,
        request.body
      );

      return {
        message: "Leesprofiel succesvol opgeslagen.",
        profile,
      };
    }
  );
};
