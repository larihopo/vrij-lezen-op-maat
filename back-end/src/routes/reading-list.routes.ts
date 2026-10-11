import type { FastifyPluginAsync } from "fastify";

import {
  getStudentReadingList,
  addBookToReadingList,
  setReadingStatus,
} from "../services/reading-list.service.js";

type AddBookBody = {
  bookId: string;
};

type UpdateStatusBody = {
  isRead: boolean;
};

type ItemParams = {
  itemId: string;
};

// Standaard HTTP-foutmelding
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

// Boekgegevens die bij een leeslijstitem horen.
// Het boek kan null zijn als het niet meer
// in de MongoDB-catalogus gevonden wordt.
const readingListBookSchema = {
  type: "object",
  nullable: true,
  required: ["title", "author", "description"],
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
    },
    author: {
      type: "string",
      nullable: true,
    },
    description: {
      type: "string",
    },
  },
} as const;

// Een item uit de persoonlijke leeslijst
const readingListItemSchema = {
  type: "object",
  required: [
    "id",
    "bookId",
    "isRead",
    "addedByUserId",
    "createdAt",
    "book",
  ],
  additionalProperties: false,
  properties: {
    id: {
      type: "integer",
      description: "Uniek ID van het leeslijstitem.",
    },
    bookId: {
      type: "string",
      description: "ID van het boek in MongoDB.",
    },
    isRead: {
      type: "boolean",
      description: "Geeft aan of het boek gelezen is.",
    },
    addedByUserId: {
      type: "integer",
      description:
        "ID van de student of docent die het boek toevoegde.",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Moment waarop het boek is toegevoegd.",
    },
    book: readingListBookSchema,
  },
} as const;

// De PATCH-repository geeft alleen deze
// twee velden van het gewijzigde item terug.
const updatedStatusItemSchema = {
  type: "object",
  required: ["id", "isRead"],
  additionalProperties: false,
  properties: {
    id: {
      type: "integer",
    },
    isRead: {
      type: "boolean",
    },
  },
} as const;

export const readingListRoutes: FastifyPluginAsync =
  async (app) => {
    // Alle routes zijn alleen toegankelijk voor studenten.
    app.addHook("preHandler", async (request, reply) => {
      await request.jwtVerify();

      if (request.user.role !== "student") {
        return reply.status(403).send({
          message: "Alleen studenten hebben toegang.",
        });
      }
    });

    // GET /api/leeslijst
    app.get(
      "/leeslijst",
      {
        schema: {
          tags: ["Leeslijst"],
          summary: "Persoonlijke leeslijst ophalen",
          description:
            "Geeft de leeslijst van de ingelogde student " +
            "terug, inclusief beschikbare boekgegevens " +
            "uit de MongoDB-catalogus.",

          security: [{ bearerAuth: [] }],

          response: {
            200: {
              description: "Leeslijst succesvol opgehaald.",
              type: "object",
              required: ["items", "total"],
              additionalProperties: false,
              properties: {
                items: {
                  type: "array",
                  items: readingListItemSchema,
                },
                total: {
                  type: "integer",
                  minimum: 0,
                },
              },
            },
            401: {
              description: "Niet ingelogd of ongeldig JWT.",
              ...errorResponseSchema,
            },
            403: {
              description:
                "Alleen studenten hebben toegang.",
              ...errorResponseSchema,
            },
          },
        },
      },
      async (request) => {
        return getStudentReadingList(
          request.user.userId
        );
      }
    );

    // POST /api/leeslijst
    app.post<{ Body: AddBookBody }>(
      "/leeslijst",
      {
        schema: {
          tags: ["Leeslijst"],
          summary: "Boek aan persoonlijke leeslijst toevoegen",
          description:
            "Voegt een bestaand catalogusboek toe aan " +
            "de leeslijst van de ingelogde student. " +
            "Een boek kan niet tweemaal worden toegevoegd.",

          security: [{ bearerAuth: [] }],

          body: {
            type: "object",
            required: ["bookId"],
            additionalProperties: false,
            properties: {
              bookId: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                description:
                  "ID van een bestaand boek in MongoDB.",
              },
            },
          },

          response: {
            201: {
              description: "Boek toegevoegd aan de leeslijst.",
              type: "object",
              required: ["message", "itemId"],
              additionalProperties: false,
              properties: {
                message: {
                  type: "string",
                },
                itemId: {
                  type: "integer",
                  description:
                    "ID van het nieuwe leeslijstitem.",
                },
              },
            },
            400: {
              description: "Ongeldige invoer.",
              ...errorResponseSchema,
            },
            401: {
              description: "Niet ingelogd of ongeldig JWT.",
              ...errorResponseSchema,
            },
            403: {
              description:
                "Alleen studenten mogen boeken toevoegen.",
              ...errorResponseSchema,
            },
            404: {
              description:
                "Boek bestaat niet in de catalogus.",
              ...errorResponseSchema,
            },
            409: {
              description:
                "Boek staat al op de leeslijst.",
              ...errorResponseSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const result = await addBookToReadingList(
          request.user.userId,
          request.user.userId,
          request.body.bookId
        );

        if (result.status === "not_found") {
          return reply.status(404).send({
            message:
              "Dit boek bestaat niet in de catalogus.",
          });
        }

        if (result.status === "duplicate") {
          return reply.status(409).send({
            message:
              "Dit boek staat al op je leeslijst.",
          });
        }

        return reply.status(201).send({
          message: "Boek toegevoegd aan je leeslijst.",
          itemId: result.itemId,
        });
      }
    );

    // PATCH /api/leeslijst/:itemId
    app.patch<{
      Params: ItemParams;
      Body: UpdateStatusBody;
    }>(
      "/leeslijst/:itemId",
      {
        schema: {
          tags: ["Leeslijst"],
          summary: "Gelezen-status van een boek wijzigen",
          description:
            "Wijzigt de gelezen-status van een " +
            "leeslijstitem dat bij de ingelogde " +
            "student hoort.",

          security: [{ bearerAuth: [] }],

          params: {
            type: "object",
            required: ["itemId"],
            properties: {
              itemId: {
                type: "string",
                pattern: "^[1-9][0-9]*$",
                description:
                  "Positief numeriek ID van het leeslijstitem.",
              },
            },
          },

          body: {
            type: "object",
            required: ["isRead"],
            additionalProperties: false,
            properties: {
              isRead: {
                type: "boolean",
                description:
                  "true voor gelezen, false voor niet gelezen.",
              },
            },
          },

          response: {
            200: {
              description: "Leesstatus bijgewerkt.",
              type: "object",
              required: ["message", "item"],
              additionalProperties: false,
              properties: {
                message: {
                  type: "string",
                },
                item: updatedStatusItemSchema,
              },
            },
            400: {
              description:
                "Ongeldig item-ID of ongeldige invoer.",
              ...errorResponseSchema,
            },
            401: {
              description: "Niet ingelogd of ongeldig JWT.",
              ...errorResponseSchema,
            },
            403: {
              description:
                "Alleen studenten hebben toegang.",
              ...errorResponseSchema,
            },
            404: {
              description:
                "Leeslijstitem niet gevonden of " +
                "behoort niet tot deze student.",
              ...errorResponseSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const itemId = Number(request.params.itemId);

        if (!Number.isSafeInteger(itemId)) {
          return reply.status(400).send({
            message: "Ongeldig leeslijstitem.",
          });
        }

        const item = await setReadingStatus(
          request.user.userId,
          itemId,
          request.body.isRead
        );

        if (!item) {
          return reply.status(404).send({
            message: "Leeslijstitem niet gevonden.",
          });
        }

        return {
          message: "Leesstatus bijgewerkt.",
          item,
        };
      }
    );
  };
