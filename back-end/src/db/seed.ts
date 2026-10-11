import "dotenv/config";
import { hash } from "bcryptjs";
import { db, client } from "./index.js";
import { users } from "./schema.js";

async function seed() {
  const studentPassword = process.env.DEMO_STUDENT_PASSWORD;
  const docentPassword = process.env.DEMO_DOCENT_PASSWORD;
  const docent2Password = process.env.DEMO_DOCENT_2_PASSWORD;

  if (
    !studentPassword ||
    !docentPassword ||
    !docent2Password ||
    studentPassword.length < 12 ||
    docentPassword.length < 12 ||
    docent2Password.length < 12 ||
    studentPassword === docentPassword ||
    docent2Password === studentPassword ||
    docent2Password === docentPassword
  ) {
    throw new Error(
      "Gebruik twee verschillende testwachtwoorden van minimaal 12 tekens."
    );
  }

  try {
    const demoUsers = [
      {
        name: "Demo Student",
        email: "student@vrijlezen.test",
        role: "student" as const,
        passwordHash: await hash(studentPassword, 12),
      },
      {
        name: "Demo Docent",
        email: "docent@vrijlezen.test",
        role: "docent" as const,
        passwordHash: await hash(docentPassword, 12),
      },
      {
        name: "Demo Docent 2",
        email: "docent2@vrijlezen.test",
        role: "docent" as const,
        passwordHash: await hash(docent2Password, 12),
      },
    ];

    for (const user of demoUsers) {
      await db
        .insert(users)
        .values(user)
        .onConflictDoUpdate({
          target: users.email,
          set: {
            name: user.name,
            role: user.role,
            passwordHash: user.passwordHash,
          },
        });
    }

    console.log("Demoaccounts succesvol aangemaakt!");
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
