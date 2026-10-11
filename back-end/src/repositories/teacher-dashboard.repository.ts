import { and, asc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  users,
  readingProfiles,
  teacherStudentLinks,
} from "../db/schema.js";

// Alleen studenten tonen die:
// 1. aan deze docent gekoppeld zijn
// 2. daadwerkelijk student zijn
// 3. een opgeslagen leesprofiel hebben
export async function findStudentsForTeacher(
  teacherId: number
) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(teacherStudentLinks)
    .innerJoin(
      users,
      eq(teacherStudentLinks.studentId, users.id)
    )
    .innerJoin(
      readingProfiles,
      eq(readingProfiles.userId, users.id)
    )
    .where(
      and(
        eq(teacherStudentLinks.teacherId, teacherId),
        eq(users.role, "student")
      )
    )
    .orderBy(asc(users.name));
}

// Controleren of één specifieke student
// zichtbaar mag zijn voor deze docent
export async function findStudentForTeacher(
  teacherId: number,
  studentId: number
) {
  const [student] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(teacherStudentLinks)
    .innerJoin(
      users,
      eq(teacherStudentLinks.studentId, users.id)
    )
    .innerJoin(
      readingProfiles,
      eq(readingProfiles.userId, users.id)
    )
    .where(
      and(
        eq(teacherStudentLinks.teacherId, teacherId),
        eq(teacherStudentLinks.studentId, studentId),
        eq(users.role, "student")
      )
    )
    .limit(1);

  return student ?? null;
}
