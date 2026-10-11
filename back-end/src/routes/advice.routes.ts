import type { FastifyPluginAsync } from "fastify";

import {
  getAdviceForStudent,
} from "../services/advice.service.js";

const errorResponseSchema = {
  type: "object",
  required: ["message"],
  additionalProperties: true,
  properties: {
    statusCode: { type: "integer" },
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const adviceRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/advies",
    {
      schema: {
        tags: ["Leesadvies"],
        summary: "Persoonlijk leesadvies ophalen",
        description:
          "Geeft drie aanbevolen leesmaterialen terug " +
          "op basis van het opgeslagen leesprofiel van " +
          "de ingelogde student.",

        security: [{ bearerAuth: [] }],

        response: {
          200: {
            description:
              "Persoonlijke leesadviezen succesvol opgehaald.",
            type: "object",
            required: ["items", "total"],
            additionalProperties: true,
            properties: {
              items: {
                type: "array",
                description:
                "De drie best passende leesmaterialen, gesorteerd op matchscore.",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  required: [
                    "id",
                    "title",
                    "description",
                    "readingLevel",
                    "genre",
                    "topics",
                    "length",
                    "materialType",
                    "score",
                    "reason",
                  ],
                  additionalProperties: false,
                  properties: {
                    id: {
                      type: "string",
                      description: "Uniek boek-ID uit MongoDB.",
                    },
                    title: {
                      type: "string",
                      description: "Titel van het leesmateriaal.",
                    },
                    description: {
                      type: "string",
                      description: "Beschrijving van het leesmateriaal.",
                    },
                    readingLevel: {
                      type: "string",
                      nullable: true,
                      description: "Leesniveau, indien bekend.",
                    },
                    genre: {
                      type: "string",
                      nullable: true,
                      description: "Genre, indien beschikbaar.",
                    },
                    topics: {
                      type: "array",
                      items: { type: "string" },
                      description: "Onderwerpen van het leesmateriaal.",
                    },
                    length: {
                      type: "string",
                      nullable: true,
                      description: "Lengtecategorie, indien beschikbaar.",
                    },
                    materialType: {
                      type: "string",
                      nullable: true,
                      description: "Soort leesmateriaal.",
                    },
                    score: {
                      type: "integer",
                      minimum: 0,
                      maximum: 10,
                      description:
                      "Matchscore: leesniveau maximaal 4 punten, " +
                      "genre 3, onderwerp 2 en lengte 1.",
                    },
                    reason: {
                      type: "string",
                      description:
                      "Uitleg waarom dit leesmateriaal wordt aanbevolen.",
                    },
                  },
                },
              },

              total: {
                type: "integer",
                description: "Aantal aanbevolen boeken.",
              },
            },
          },

          401: {
            description: "Niet ingelogd of ongeldig JWT.",
            ...errorResponseSchema,
          },

          403: {
            description:
              "Alleen studenten mogen leesadvies ophalen.",
            ...errorResponseSchema,
          },

          409: {
            description:
              "De student heeft nog geen leesprofiel.",
            ...errorResponseSchema,
          },

          422: {
            description:
              "Er zijn onvoldoende titels voor drie adviezen.",
            ...errorResponseSchema,
          },
        },
      },

      preHandler: async (request, reply) => {
        // Controleren of de gebruiker is ingelogd
        await request.jwtVerify();

        // Alleen studenten mogen eigen advies ophalen
        if (request.user.role !== "student") {
          return reply.status(403).send({
            message:
              "Alleen studenten kunnen leesadvies ophalen.",
          });
        }
      },
    },

    async (request, reply) => {
      const recommendations = await getAdviceForStudent(
        request.user.userId
      );

      // De student heeft nog geen leesprofiel
      if (recommendations === null) {
        return reply.status(409).send({
          message:
            "Vul eerst je leesprofiel in om advies te ontvangen.",
        });
      }

      // Er zijn onvoldoende verschillende titels
      if (recommendations.length < 3) {
        return reply.status(422).send({
          message:
            "Er zijn onvoldoende titels beschikbaar voor drie adviezen.",
        });
      }

      return {
        items: recommendations,
        total: recommendations.length,
      };
    }
  );
};
