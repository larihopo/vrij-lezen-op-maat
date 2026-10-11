import {
  findAllTeachers,
  findTeacherById,
  findTeacherLink,
  saveTeacherLink,
} from "../repositories/teacher-link.repository.js";

export async function getAvailableTeachers() {
  return findAllTeachers();
}

export async function getStudentTeacherLink(
  studentId: number
) {
  return findTeacherLink(studentId);
}

export async function linkStudentToTeacher(
  studentId: number,
  teacherId: number
) {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) {
    return null;
  }

  return saveTeacherLink(studentId, teacherId);
}
