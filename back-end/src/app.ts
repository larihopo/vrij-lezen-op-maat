import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { sql } from "drizzle-orm";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { db } from "./db/index.js";
import { authRoutes } from "./routes/auth.routes.js";
import { mongoClient } from "./db/mongo.js";
import { catalogRoutes } from "./routes/catalog.routes.js";
import { profileRoutes } from "./routes/profile.routes.js";
import { adviceRoutes } from "./routes/advice.routes.js";
import { readingListRoutes } from "./routes/reading-list.routes.js";
import { teacherLinkRoutes } from "./routes/teacher-link.routes.js";
import { teacherDashboardRoutes } from "./routes/teacher-dashboard.routes.js";


const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET ontbreekt of is te kort.");
}

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Vrij lezen op maat API",
        description:
          "REST API voor leesprofielen, persoonlijke " +
          "leesadviezen, catalogus, leeslijsten " +
          "en docentenfunctionaliteit.",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3001",
          description: "Lokale ontwikkelomgeving",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  app.register(swaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });


  // Alleen onze lokale front-end mag API-responses lezen
  app.register(cors, {
    origin: "http://localhost:3000",
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });


  // JWT-authenticatie configureren
  app.register(jwt, {
    secret: jwtSecret!,
    sign: {
      expiresIn: "2h",
    },
  });

  // Authenticatieroutes
  app.register(authRoutes, {
    prefix: "/api/auth",
  });

  // Fastify controleren
  app.get("/api/health", async () => {
    return {
      status: "ok",
      message: "Vrij lezen op maat API werkt!",
    };
  });

  // PostgreSQL controleren
  app.get("/api/health/database", async (request, reply) => {
    try {
      await db.execute(sql`SELECT 1`);

      return {
        status: "ok",
        database: "postgresql",
        message: "Databaseverbinding werkt!",
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(503).send({
        status: "error",
        message: "Database is niet bereikbaar.",
      });
    }
  });
  

  app.get("/api/health/mongodb", async (request, reply) => {
    try {
      await mongoClient.db("admin").command({ ping: 1 });

      const total = await mongoClient
        .db("vrijlezen_catalogus")
        .collection("books")
        .countDocuments();

      return {
        status: "ok",
        database: "mongodb",
        totalBooks: total,
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(503).send({
        status: "error",
        message: "MongoDB is niet bereikbaar.",
      });
    }
  });

  app.register(profileRoutes, {
    prefix: "/api",
  });

  app.register(adviceRoutes, {
    prefix: "/api",
  });

  app.register(catalogRoutes);

  app.register(readingListRoutes, {
    prefix: "/api",
  });

  app.register(teacherLinkRoutes, {
    prefix: "/api",
  });

  app.register(teacherDashboardRoutes, {
    prefix: "/api/docent",
  });

  return app;
}
