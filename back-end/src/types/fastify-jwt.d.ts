import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      userId: number;
      role: "student" | "docent";
    };

    user: {
      userId: number;
      role: "student" | "docent";
    };
  }
}
