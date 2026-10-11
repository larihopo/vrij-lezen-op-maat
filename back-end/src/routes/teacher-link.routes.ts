import type { FastifyPluginAsync } from "fastify";

import {
  getAvailableTeachers,
  getStudentTeacherLink,
  linkStudentToTeacher,
} from "../services/teacher-link.service.js";

type LinkTeacherBody = {
  teacherId: number;
};

// Schema voor HTTP-foutmeldingen
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

// Docent in de lijst met beschikbare docenten
const availableTeacherSchema = {
  type: "object",
  required: ["id", "name"],
  additionalProperties: false,
  properties: {
    id: {
      type: "integer",
      description: "Uniek gebruikers-ID van de docent.",
    },
    name: {
      type: "string",
      description: "Naam van de docent.",
    },
  },
} as const;

// Opgeslagen koppeling van een student aan een docent
const teacherLinkSchema = {
  type: "object",
  required: ["teacherId", "teacherName"],
  additionalProperties: false,
  properties: {
    teacherId: {
      type: "integer",
      description: "ID van de gekoppelde docent.",
    },
    teacherName: {
      type: "string",
      description: "Naam van de gekoppelde docent.",
    },
  },
} as const;

export const teacherLinkRoutes: FastifyPluginAsync =
  async (app) => {
    // Alleen studenten mogen deze routes gebruiken.
    app.addHook("preHandler", async (request, reply) => {
      await request.jwtVerify();

      if (request.user.role !== "student") {
        return reply.status(403).send({
          message: "Alleen studenten hebben toegang.",
        });
      }
    });

    // GET /api/docenten
    app.get(
      "/docenten",
      {
        schema: {
          tags: ["Docentkoppeling"],
          summary: "Beschikbare docenten ophalen",
          description:
            "Geeft alle geregistreerde docenten terug " +
            "waaruit een ingelogde student kan kiezen.",

          security: [{ bearerAuth: [] }],

          response: {
            200: {
              description:
                "Beschikbare docenten succesvol opgehaald.",
              type: "object",
              required: ["teachers"],
              additionalProperties: false,
              properties: {
                teachers: {
                  type: "array",
                  items: availableTeacherSchema,
                },
              },
            },
            401: {
              description:
                "Niet ingelogd of ongeldig JWT.",
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
      async () => {
        const teachers = await getAvailableTeachers();

        return { teachers };
      }
    );

    // GET /api/docent-koppeling
    app.get(
      "/docent-koppeling",
      {
        schema: {
          tags: ["Docentkoppeling"],
          summary: "Eigen docentkoppeling ophalen",
          description:
            "Geeft de docent terug aan wie de " +
            "ingelogde student gekoppeld is. " +
            "Als er geen koppeling bestaat, is teacher null.",

          security: [{ bearerAuth: [] }],

          response: {
            200: {
              description:
                "Huidige docentkoppeling opgehaald.",
              type: "object",
              required: ["teacher"],
              additionalProperties: false,
              properties: {
                teacher: {
                  ...teacherLinkSchema,
                  nullable: true,
                },
              },
            },
            401: {
              description:
                "Niet ingelogd of ongeldig JWT.",
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
        const teacher = await getStudentTeacherLink(
          request.user.userId
        );

        return { teacher };
      }
    );

    // PUT /api/docent-koppeling
    app.put<{ Body: LinkTeacherBody }>(
      "/docent-koppeling",
      {
        schema: {
          tags: ["Docentkoppeling"],
          summary: "Student aan een docent koppelen",
          description:
            "Koppelt de ingelogde student aan een " +
            "bestaande docent. Een bestaande koppeling " +
            "wordt vervangen door de nieuwe koppeling.",

          security: [{ bearerAuth: [] }],

          body: {
            type: "object",
            required: ["teacherId"],
            additionalProperties: false,
            properties: {
              teacherId: {
                type: "integer",
                minimum: 1,
                description:
                  "ID van de docent waaraan de student " +
                  "gekoppeld wil worden.",
              },
            },
          },

          response: {
            200: {
              description:
                "Student succesvol gekoppeld aan de docent.",
              type: "object",
              required: ["message", "teacher"],
              additionalProperties: false,
              properties: {
                message: {
                  type: "string",
                },
                teacher: {
                  ...teacherLinkSchema,
                  nullable: true,
                },
              },
            },
            400: {
              description:
                "Ongeldige of ontbrekende teacherId.",
              ...errorResponseSchema,
            },
            401: {
              description:
                "Niet ingelogd of ongeldig JWT.",
              ...errorResponseSchema,
            },
            403: {
              description:
                "Alleen studenten mogen een docent koppelen.",
              ...errorResponseSchema,
            },
            404: {
              description:
                "De gekozen docent bestaat niet.",
              ...errorResponseSchema,
            },
          },
        },
      },
      async (request, reply) => {
        const teacher = await linkStudentToTeacher(
          request.user.userId,
          request.body.teacherId
        );

        if (!teacher) {
          return reply.status(404).send({
            message: "De gekozen docent bestaat niet.",
          });
        }

        return {
          message:
            "Je bent succesvol gekoppeld aan de docent.",
          teacher,
        };
      }
    );
  };
