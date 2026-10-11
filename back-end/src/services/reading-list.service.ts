import { getBooksCollection } from "../db/mongo.js";

import {
  findReadingListItemsByStudentId,
  insertReadingListItem,
  updateReadingListItemStatus,
} from "../repositories/reading-list.repository.js";

// Persoonlijke leeslijst inclusief boekgegevens
export async function getStudentReadingList(
  studentId: number
) {
  const items = await findReadingListItemsByStudentId(
    studentId
  );

  if (items.length === 0) {
    return { items: [], total: 0 };
  }

  const bookIds = items.map((item) => item.bookId);

  const books = await getBooksCollection()
    .find(
      { _id: { $in: bookIds } },
      {
        projection: {
          title: 1,
          author: 1,
          description: 1,
        },
      }
    )
    .toArray();

  const bookMap = new Map(
    books.map((book) => [
      book._id,
      {
        title: book.title,
        author: book.author ?? null,
        description: book.description,
      },
    ])
  );

  const result = items.map((item) => ({
    ...item,
    book: bookMap.get(item.bookId) ?? null,
  }));

  return {
    items: result,
    total: result.length,
  };
}

// Controleren of een boek bestaat en het toevoegen
export async function addBookToReadingList(
  studentId: number,
  addedByUserId: number,
  bookId: string
) {
  const book = await getBooksCollection().findOne({
    _id: bookId,
  });

  if (!book) {
    return { status: "not_found" as const };
  }

  const item = await insertReadingListItem(
    studentId,
    addedByUserId,
    bookId
  );

  if (!item) {
    return { status: "duplicate" as const };
  }

  return {
    status: "created" as const,
    itemId: item.id,
  };
}

// Status gelezen / niet gelezen wijzigen
export async function setReadingStatus(
  studentId: number,
  itemId: number,
  isRead: boolean
) {
  return updateReadingListItemStatus(
    studentId,
    itemId,
    isRead
  );
}
