import type { FastifyPluginAsync } from "fastify";

import {
  getTeacherStudents,
  getTeacherStudentDetail,
  addBookForTeacherStudent,
} from "../services/teacher-dashboard.service.js";

type StudentParams = {
  studentId: string;
};

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

const studentParamsSchema = {
  type: "object",
  required: ["studentId"],
  additionalProperties: false,
  properties: {
    studentId: {
      type: "string",
      pattern: "^[1-9][0-9]*$",
      description: "Positief numeriek ID van een student.",
    },
  },
} as const;

export const teacherDashboardRoutes:
  FastifyPluginAsync = async (app) => {

  // Alle routes vereisen een docent-JWT.
  app.addHook("preHandler", async (request, reply) => {
    await request.jwtVerify();

    if (request.user.role !== "docent") {
      return reply.status(403).send({
        message: "Alleen docenten hebben toegang.",
      });
    }
  });

  // GET /api/docent/studenten
  app.get(
    "/studenten",
    {
      schema: {
        tags: ["Docentenomgeving"],
        summary: "Gekoppelde studenten ophalen",
        description:
          "Geeft het overzicht van studenten terug " +
          "die aan de ingelogde docent gekoppeld zijn.",

        security: [{ bearerAuth: [] }],

        response: {
          200: {
            description: "Gekoppelde studenten succesvol opgehaald.",
            type: "object",
            required: ["students", "total"],
            additionalProperties: false,
            properties: {
              students: {
                type: "array",
                description:
                  "Studenten die aan de docent gekoppeld zijn en een leesprofiel hebben.",
                items: {
                  type: "object",
                  required: ["id", "name", "email"],
                  additionalProperties: false,
                  properties: {
                    id: {
                      type: "integer",
                    },
                    name: {
                      type: "string",
                    },
                    email: {
                      type: "string",
                    },
                  },
                },
              },
              total: {
                type: "integer",
                minimum: 0,
                description: "Aantal zichtbare studenten.",
              },
            },
          },
          401: {
            description: "Niet ingelogd of ongeldig JWT.",
            ...errorResponseSchema,
          },
          403: {
            description:
              "Alleen docenten hebben toegang.",
            ...errorResponseSchema,
          },
        },
      },
    },
    async (request) => {
      return getTeacherStudents(
        request.user.userId
      );
    }
  );

  // GET /api/docent/studenten/:studentId
  app.get<{ Params: StudentParams }>(
    "/studenten/:studentId",
    {
      schema: {
        tags: ["Docentenomgeving"],
        summary: "Gegevens van gekoppelde student ophalen",
        description:
          "Geeft studentgegevens, leesprofiel en " +
          "leeslijst terug. Alleen de gekoppelde " +
          "docent heeft toegang.",

        security: [{ bearerAuth: [] }],

        params: studentParamsSchema,

        response: {
          200: {
            description: "Gegevens van gekoppelde student opgehaald.",
            type: "object",
            required: ["student", "profile", "readingList"],
            additionalProperties: false,
            properties: {
              student: {
                type: "object",
                required: ["id", "name", "email"],
                additionalProperties: false,
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  email: { type: "string" },
                },
              },

              profile: {
                type: "object",
                nullable: true,
                required: [
                  "userId",
                  "niveau",
                  "genre",
                  "onderwerp",
                  "lengte",
                  "leesdoel",
                  "updatedAt",
                ],
                additionalProperties: false,
                properties: {
                  userId: { type: "integer" },
                  niveau: { type: "string" },
                  genre: { type: "string" },
                  onderwerp: { type: "string" },
                  lengte: { type: "string" },
                  leesdoel: { type: "string" },
                  updatedAt: {
                    type: "string",
                    format: "date-time",
                  },
                },
              },

              readingList: {
                type: "object",
                required: ["items", "total"],
                additionalProperties: false,
                properties: {
                  items: {
                    type: "array",
                    items: {
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
                        id: { type: "integer" },
                        bookId: { type: "string" },
                        isRead: { type: "boolean" },
                        addedByUserId: { type: "integer" },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                        },
                        book: {
                          type: "object",
                          nullable: true,
                          required: [
                            "title",
                            "author",
                            "description",
                          ],
                          additionalProperties: false,
                          properties: {
                            title: { type: "string" },
                            author: {
                              type: "string",
                              nullable: true,
                            },
                            description: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                  total: {
                    type: "integer",
                    minimum: 0,
                  },
                },
              },
            },
          },
          400: {
            description: "Ongeldig student-ID.",
            ...errorResponseSchema,
          },
          401: {
            description: "Niet ingelogd of ongeldig JWT.",
            ...errorResponseSchema,
          },
          403: {
            description:
              "Alleen docenten hebben toegang.",
            ...errorResponseSchema,
          },
          404: {
            description:
              "Student bestaat niet of is niet " +
              "aan deze docent gekoppeld.",
            ...errorResponseSchema,
          },
        },
      },
    },
    async (request, reply) => {
      const studentId = Number(
        request.params.studentId
      );

      if (!Number.isSafeInteger(studentId)) {
        return reply.status(400).send({
          message: "Ongeldig student-ID.",
        });
      }

      const result = await getTeacherStudentDetail(
        request.user.userId,
        studentId
      );

      if (!result) {
        return reply.status(404).send({
          message: "Student niet gevonden.",
        });
      }

      return result;
    }
  );

  // POST /api/docent/studenten/:studentId/leeslijst
  app.post<{
    Params: StudentParams;
    Body: { bookId: string };
  }>(
    "/studenten/:studentId/leeslijst",
    {
      schema: {
        tags: ["Docentenomgeving"],
        summary: "Boek toevoegen aan leeslijst van student",
        description:
          "Een docent voegt een catalogusboek toe " +
          "aan de leeslijst van een gekoppelde student.",

        security: [{ bearerAuth: [] }],

        params: studentParamsSchema,

        body: {
          type: "object",
          required: ["bookId"],
          additionalProperties: false,
          properties: {
            bookId: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Boek-ID uit MongoDB.",
            },
          },
        },

        response: {
          201: {
            description:
              "Boek toegevoegd aan de leeslijst.",
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
            description:
              "Ongeldig student-ID of ongeldige invoer.",
            ...errorResponseSchema,
          },
          401: {
            description: "Niet ingelogd of ongeldig JWT.",
            ...errorResponseSchema,
          },
          403: {
            description:
              "Alleen docenten hebben toegang.",
            ...errorResponseSchema,
          },
          404: {
            description:
              "Student niet gekoppeld of boek bestaat niet.",
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
      const studentId = Number(
        request.params.studentId
      );

      if (!Number.isSafeInteger(studentId)) {
        return reply.status(400).send({
          message: "Ongeldig student-ID.",
        });
      }

      const result = await addBookForTeacherStudent(
        request.user.userId,
        studentId,
        request.body.bookId
      );

      if (result.status === "student_not_found") {
        return reply.status(404).send({
          message: "Student niet gevonden.",
        });
      }

      if (result.status === "not_found") {
        return reply.status(404).send({
          message: "Boek niet gevonden.",
        });
      }

      if (result.status === "duplicate") {
        return reply.status(409).send({
          message:
            "Dit boek staat al op de leeslijst van de student.",
        });
      }

      return reply.status(201).send({
        message:
          "Boek toegevoegd aan de leeslijst van de student.",
        itemId: result.itemId,
      });
    }
  );
};
