import { API_BASE_URL } from "./api";

export type ReadingListItem = {
  id: number;
  bookId: string;
  isRead: boolean;
  addedByUserId: number;
  createdAt: string;
  book: {
    title: string;
    author: string | null;
    description: string;
  } | null;
};

export type ReadingListResponse = {
  items: ReadingListItem[];
  total: number;
};

export class ReadingListApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ReadingListApiError";
  }
}

// Persoonlijke leeslijst ophalen
export async function fetchReadingList(
  token: string,
  signal?: AbortSignal
): Promise<ReadingListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/leeslijst`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new ReadingListApiError(
      response.status,
      "Je leeslijst kon niet worden opgehaald."
    );
  }

  return (await response.json()) as ReadingListResponse;
}

// Boek toevoegen
export async function addBookToReadingList(
  token: string,
  bookId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/leeslijst`,
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
    throw new ReadingListApiError(
      response.status,
      response.status === 409
        ? "Dit boek staat al op je leeslijst."
        : "Toevoegen aan de leeslijst is mislukt."
    );
  }
}

// Status gelezen / niet gelezen wijzigen
export async function updateReadingStatus(
  token: string,
  itemId: number,
  isRead: boolean
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/leeslijst/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isRead }),
    }
  );

  if (!response.ok) {
    throw new ReadingListApiError(
      response.status,
      "De leesstatus kon niet worden bijgewerkt."
    );
  }
}
