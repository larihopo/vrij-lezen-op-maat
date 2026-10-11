CREATE TYPE "public"."user_role" AS ENUM('student', 'docent');--> statement-breakpoint
CREATE TABLE "reading_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"book_id" varchar(100) NOT NULL,
	"added_by_user_id" integer NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"niveau" varchar(50) NOT NULL,
	"genre" varchar(100) NOT NULL,
	"onderwerp" varchar(100) NOT NULL,
	"lengte" varchar(50) NOT NULL,
	"leesdoel" varchar(150) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_student_links" (
	"student_id" integer PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "reading_list_items" ADD CONSTRAINT "reading_list_items_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_list_items" ADD CONSTRAINT "reading_list_items_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_profiles" ADD CONSTRAINT "reading_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_student_links" ADD CONSTRAINT "teacher_student_links_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_student_links" ADD CONSTRAINT "teacher_student_links_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reading_list_student_book_unique" ON "reading_list_items" USING btree ("student_id","book_id");--> statement-breakpoint
CREATE INDEX "reading_list_student_idx" ON "reading_list_items" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "teacher_student_teacher_idx" ON "teacher_student_links" USING btree ("teacher_id");