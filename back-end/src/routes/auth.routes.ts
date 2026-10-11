import type { FastifyPluginAsync } from "fastify";
import { authenticateUser } from "../services/auth.service.js";

type LoginBody = {
  email: string;
  password: string;
};

const messageResponse = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
} as const;

const userResponse = {
  type: "object",
  required: ["id", "name", "email", "role"],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    email: { type: "string" },
    role: {
      type: "string",
      enum: ["student", "docent"],
    },
  },
} as const;

export const authRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/auth/login
  app.post<{ Body: LoginBody }>(
    "/login",
    {
      schema: {
        tags: ["Authenticatie"],
        summary: "Inloggen als student of docent",
        description:
          "Controleert de inloggegevens en retourneert een JWT-token.",
        body: {
          type: "object",
          required: ["email", "password"],
          additionalProperties: false,
          properties: {
            email: {
              type: "string",
              minLength: 3,
              maxLength: 255,
            },
            password: {
              type: "string",
              minLength: 1,
              maxLength: 256,
            },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["token", "user"],
            properties: {
              token: { type: "string" },
              user: userResponse,
            },
          },
          401: messageResponse,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const user = await authenticateUser(email, password);

      if (!user) {
        return reply.status(401).send({
          message: "Ongeldige e-mail of wachtwoord.",
        });
      }

      const token = await reply.jwtSign({
        userId: user.id,
        role: user.role,
      });

      return {
        token,
        user,
      };
    }
  );

  // GET /api/auth/check
  app.get(
    "/check",
    {
      schema: {
        tags: ["Authenticatie"],
        summary: "Controleren of het JWT geldig is",
        security: [{ bearerAuth: [] }],
        response: {
          200: messageResponse,
          401: messageResponse,
        },
      },
    },
    async (request) => {
      await request.jwtVerify();

      return {
        message: "Je JWT-token is geldig.",
      };
    }
  );

  // GET /api/auth/docent-check
  app.get(
    "/docent-check",
    {
      schema: {
        tags: ["Authenticatie"],
        summary: "Docenttoegang controleren",
        security: [{ bearerAuth: [] }],
        response: {
          200: messageResponse,
          401: messageResponse,
          403: messageResponse,
        },
      },
    },
    async (request, reply) => {
      await request.jwtVerify();

      if (request.user.role !== "docent") {
        return reply.status(403).send({
          message: "Geen toegang. Alleen voor docenten.",
        });
      }

      return {
        message: "Docenttoegang toegestaan.",
      };
    }
  );
};
