import { API_BASE_URL } from "./api";
import type { ReadingProfile } from "./profile";
import type { ReadingListResponse } from "./reading-list";

export type TeacherStudent = {
  id: number;
  name: string;
  email: string;
};

export type TeacherStudentsResponse = {
  students: TeacherStudent[];
  total: number;
};

export type TeacherStudentDetail = {
  student: TeacherStudent;
  profile: ReadingProfile | null;
  readingList: ReadingListResponse;
};

export class TeacherDashboardApiError extends Error {
  constructor(public status: number) {
    super("Docentgegevens ophalen is mislukt.");
    this.name = "TeacherDashboardApiError";
  }
}

// Alle studenten van de ingelogde docent
export async function fetchTeacherStudents(
  token: string,
  signal?: AbortSignal
): Promise<TeacherStudentsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/docent/studenten`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    throw new TeacherDashboardApiError(response.status);
  }

  return response.json();
}

// Gegevens van één gekoppelde student
export async function fetchTeacherStudentDetail(
  token: string,
  studentId: number,
  signal?: AbortSignal
): Promise<TeacherStudentDetail> {
  const response = await fetch(
    `${API_BASE_URL}/api/docent/studenten/${studentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    throw new TeacherDashboardApiError(response.status);
  }

  return response.json();
}

export async function addBookForTeacherStudent(
  token: string,
  studentId: number,
  bookId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/docent/studenten/${studentId}/leeslijst`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId }),
    }
  );

  if (!response.ok) {
    throw new TeacherDashboardApiError(response.status);
  }
}
