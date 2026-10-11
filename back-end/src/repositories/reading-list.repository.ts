import { and, desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { readingListItems } from "../db/schema.js";

// Alle leeslijstitems van één student ophalen
export async function findReadingListItemsByStudentId(
  studentId: number
) {
  return db
    .select({
      id: readingListItems.id,
      bookId: readingListItems.bookId,
      isRead: readingListItems.isRead,
      addedByUserId: readingListItems.addedByUserId,
      createdAt: readingListItems.createdAt,
    })
    .from(readingListItems)
    .where(eq(readingListItems.studentId, studentId))
    .orderBy(desc(readingListItems.createdAt));
}

// Boek toevoegen, tenzij het al op de lijst staat
export async function insertReadingListItem(
  studentId: number,
  addedByUserId: number,
  bookId: string
) {
  const [item] = await db
    .insert(readingListItems)
    .values({
      studentId,
      addedByUserId,
      bookId,
      isRead: false,
    })
    .onConflictDoNothing({
      target: [
        readingListItems.studentId,
        readingListItems.bookId,
      ],
    })
    .returning({ id: readingListItems.id });

  return item ?? null;
}

// Gelezen-status aanpassen voor uitsluitend de eigenaar
export async function updateReadingListItemStatus(
  studentId: number,
  itemId: number,
  isRead: boolean
) {
  const [item] = await db
    .update(readingListItems)
    .set({ isRead })
    .where(
      and(
        eq(readingListItems.id, itemId),
        eq(readingListItems.studentId, studentId)
      )
    )
    .returning({
      id: readingListItems.id,
      isRead: readingListItems.isRead,
    });

  return item ?? null;
}
