import {
  findStudentsForTeacher,
  findStudentForTeacher,
} from "../repositories/teacher-dashboard.repository.js";

import {
  findProfileByUserId,
} from "../repositories/profile.repository.js";

import {
  getStudentReadingList,
  addBookToReadingList,
} from "./reading-list.service.js";

// Overzicht van studenten voor de docent
export async function getTeacherStudents(
  teacherId: number
) {
  const students = await findStudentsForTeacher(
    teacherId
  );

  return {
    students,
    total: students.length,
  };
}

// Details van één gekoppelde student
export async function getTeacherStudentDetail(
  teacherId: number,
  studentId: number
) {
  // BELANGRIJK:
  // Eerst controleren of de docent toegang heeft.
  const student = await findStudentForTeacher(
    teacherId,
    studentId
  );

  if (!student) {
    return null;
  }

  // Pas na autorisatie de privégegevens ophalen
  const [profile, readingList] = await Promise.all([
    findProfileByUserId(studentId),
    getStudentReadingList(studentId),
  ]);

  return {
    student,
    profile,
    readingList,
  };
}

export async function addBookForTeacherStudent(
  teacherId: number,
  studentId: number,
  bookId: string
) {
  // 1. Controleren of deze student gekoppeld is
  // aan de ingelogde docent én een profiel heeft.
  const student = await findStudentForTeacher(
    teacherId,
    studentId
  );

  if (!student) {
    return {
      status: "student_not_found" as const,
    };
  }

  // 2. Bestaande leeslijstservice hergebruiken.
  // studentId = eigenaar van de leeslijst
  // teacherId = gebruiker die het boek toevoegt
  return addBookToReadingList(
    studentId,
    teacherId,
    bookId
  );
}
