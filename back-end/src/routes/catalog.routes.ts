import type { FastifyPluginAsync } from "fastify";

import {
  getCatalogPage,
  getCatalogFilters,
  type CatalogQueryParams,
} from "../services/catalog.service.js";

// De gegevens die de catalogus-API van een boek teruggeeft.
const catalogBookSchema = {
  type: "object",
  required: [
    "id",
    "title",
    "description",
    "topics",
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
    author: {
      type: "string",
      nullable: true,
      description: "Auteur, indien bekend.",
    },
    description: {
      type: "string",
      description: "Beschrijving van het leesmateriaal.",
    },
    materialType: {
      type: "string",
      nullable: true,
      description: "Soort leesmateriaal.",
    },
    readingLevel: {
      type: "string",
      nullable: true,
      description: "Leesniveau, indien bekend.",
    },
    topics: {
      type: "array",
      items: { type: "string" },
      description: "Onderwerpen van het leesmateriaal.",
    },
    genre: {
      type: "string",
      nullable: true,
      description: "Genre, indien beschikbaar.",
    },
    length: {
      type: "string",
      nullable: true,
      description: "Lengtecategorie, indien beschikbaar.",
    },
  },
} as const;

// Schema voor foutmeldingen.
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

export const catalogRoutes: FastifyPluginAsync = async (app) => {
  // Catalogus met filters en paginering
  app.get<{ Querystring: CatalogQueryParams }>(
    "/api/catalog",
    {
      schema: {
        tags: ["Catalogus"],
        summary: "Boekencatalogus ophalen",
        description:
          "Openbare catalogus met paginering en filters " +
          "voor leesniveau, genre, onderwerp en lengte.",

        querystring: {
          type: "object",
          additionalProperties: false,
          properties: {
            page: {
              type: "integer",
              minimum: 1,
              default: 1,
              description: "Paginanummer vanaf 1.",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 30,
              default: 9,
              description: "Aantal boeken per pagina.",
            },
            niveau: {
              type: "string",
              minLength: 1,
              maxLength: 50,
            },
            genre: {
              type: "string",
              minLength: 1,
              maxLength: 100,
            },
            onderwerp: {
              type: "string",
              minLength: 1,
              maxLength: 100,
            },
            lengte: {
              type: "string",
              minLength: 1,
              maxLength: 50,
            },
          },
        },

        response: {
          200: {
            description: "Cataloguspagina opgehaald.",
            type: "object",
            required: [
              "items",
              "total",
              "page",
              "pageSize",
              "totalPages",
            ],
            additionalProperties: false,
            properties: {
              items: {
                type: "array",
                items: catalogBookSchema,
              },
              total: {
                type: "integer",
                minimum: 0,
                description: "Totaal aantal gevonden boeken.",
              },
              page: {
                type: "integer",
                minimum: 1,
                description: "Huidige pagina.",
              },
              pageSize: {
                type: "integer",
                minimum: 1,
                maximum: 30,
                description: "Aantal boeken per pagina.",
              },
              totalPages: {
                type: "integer",
                minimum: 0,
                description: "Totaal aantal pagina's.",
              },
            },
          },
          400: {
            description: "Ongeldige filters of paginering.",
            ...errorResponseSchema,
          },
        },
      },
    },
    async (request) => {
      return getCatalogPage(request.query);
    }
  );

  // Beschikbare catalogusfilters
  app.get(
    "/api/catalog/filters",
    {
      schema: {
        tags: ["Catalogus"],
        summary: "Beschikbare catalogusfilters ophalen",
        description:
          "Geeft de waarden terug waarop de catalogus " +
          "gefilterd kan worden. Dit endpoint is openbaar.",

        response: {
          200: {
            description: "Beschikbare filters opgehaald.",
            type: "object",
            required: [
              "niveaus",
              "genres",
              "onderwerpen",
              "lengtes",
            ],
            additionalProperties: false,
            properties: {
              niveaus: {
                type: "array",
                items: { type: "string" },
              },
              genres: {
                type: "array",
                items: { type: "string" },
              },
              onderwerpen: {
                type: "array",
                items: { type: "string" },
              },
              lengtes: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
    },
    async () => {
      return getCatalogFilters();
    }
  );
};
