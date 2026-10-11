import { compare } from "bcryptjs";
import { findUserByEmail } from "../repositories/user.repository.js";

export async function authenticateUser(
  email: string,
  password: string
) {
  const user = await findUserByEmail(
    email.trim().toLowerCase()
  );

  if (!user) {
    return null;
  }

  const passwordCorrect = await compare(
    password,
    user.passwordHash
  );

  if (!passwordCorrect) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
