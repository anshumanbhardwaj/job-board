import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const jobPostsTable = pgTable("job_posts", {
  id: text().primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  company: text().notNull(),
  companyWebsite: text("company_website").notNull(),
  userId: text("user_id").notNull(),
  location: text().notNull(),
  salary: integer().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const jobApplicationsTable = pgTable("job_applications", {
  id: text().primaryKey(),
  jobId: text()
    .notNull()
    .references(() => jobPostsTable.id),
  applicantName: text("applicant_name").notNull(),
  email: text().notNull(),
  coverLetter: text("cover_letter").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type JobPost = typeof jobPostsTable.$inferInsert;

export type JobApplication = typeof jobApplicationsTable.$inferInsert;
