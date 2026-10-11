import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// De twee mogelijke rollen
export const userRole = pgEnum("user_role", [
  "student",
  "docent",
]);

// Gebruikers: studenten en docenten
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

  role: userRole("role").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
});

// Eén leesprofiel per student
export const readingProfiles = pgTable("reading_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  niveau: varchar("niveau", { length: 50 }).notNull(),
  genre: varchar("genre", { length: 100 }).notNull(),
  onderwerp: varchar("onderwerp", { length: 100 }).notNull(),
  lengte: varchar("lengte", { length: 50 }).notNull(),
  leesdoel: varchar("leesdoel", { length: 150 }).notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
});

// Een student kan aan één docent gekoppeld worden
export const teacherStudentLinks = pgTable(
  "teacher_student_links",
  {
    studentId: integer("student_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),

    teacherId: integer("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("teacher_student_teacher_idx").on(table.teacherId),
  ],
);

// Persoonlijke leeslijsten
export const readingListItems = pgTable(
  "reading_list_items",
  {
    id: serial("id").primaryKey(),

    studentId: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // ID van een boek uit MongoDB
    bookId: varchar("book_id", { length: 100 }).notNull(),

    // Student of docent die het boek toevoegde
    addedByUserId: integer("added_by_user_id")
      .notNull()
      .references(() => users.id),

    isRead: boolean("is_read").notNull().default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reading_list_student_book_unique").on(
      table.studentId,
      table.bookId,
    ),
    index("reading_list_student_idx").on(table.studentId),
  ],
);
