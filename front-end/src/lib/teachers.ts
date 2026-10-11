import { API_BASE_URL } from "./api";

export type Teacher = {
  id: number;
  name: string;
};

export type TeacherLink = {
  teacherId: number;
  teacherName: string;
};

// Alle beschikbare docenten ophalen
export async function fetchTeachers(
  token: string,
  signal?: AbortSignal
): Promise<Teacher[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/docenten`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Docenten ophalen is mislukt.");
  }

  const data: { teachers: Teacher[] } =
    await response.json();

  return data.teachers;
}

// Huidige docentkoppeling ophalen
export async function fetchTeacherLink(
  token: string,
  signal?: AbortSignal
): Promise<TeacherLink | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/docent-koppeling`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Docentkoppeling ophalen is mislukt.");
  }

  const data: { teacher: TeacherLink | null } =
    await response.json();

  return data.teacher;
}

// Docent koppelen aan de student
export async function saveTeacherLink(
  token: string,
  teacherId: number
): Promise<TeacherLink> {
  const response = await fetch(
    `${API_BASE_URL}/api/docent-koppeling`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teacherId }),
    }
  );

  if (!response.ok) {
    throw new Error("Docent koppelen is mislukt.");
  }

  const data: { teacher: TeacherLink } =
    await response.json();

  return data.teacher;
}
