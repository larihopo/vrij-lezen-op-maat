import { and, asc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  users,
  teacherStudentLinks,
} from "../db/schema.js";

// Alle beschikbare docenten ophalen
export async function findAllTeachers() {
  return db
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(eq(users.role, "docent"))
    .orderBy(asc(users.name));
}

// Controleren of een gebruiker echt docent is
export async function findTeacherById(teacherId: number) {
  const [teacher] = await db
    .select({
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(
      and(
        eq(users.id, teacherId),
        eq(users.role, "docent")
      )
    )
    .limit(1);

  return teacher ?? null;
}

// Huidige docentkoppeling van student ophalen
export async function findTeacherLink(studentId: number) {
  const [link] = await db
    .select({
      teacherId: users.id,
      teacherName: users.name,
    })
    .from(teacherStudentLinks)
    .innerJoin(
      users,
      eq(teacherStudentLinks.teacherId, users.id)
    )
    .where(eq(teacherStudentLinks.studentId, studentId))
    .limit(1);

  return link ?? null;
}

// Een docent koppelen of bestaande koppeling wijzigen
export async function saveTeacherLink(
  studentId: number,
  teacherId: number
) {
  await db
    .insert(teacherStudentLinks)
    .values({
      studentId,
      teacherId,
    })
    .onConflictDoUpdate({
      target: teacherStudentLinks.studentId,
      set: {
        teacherId,
      },
    });

  return findTeacherLink(studentId);
}
