CREATE TABLE IF NOT EXISTS "job_applications" (
	"applicationId" text PRIMARY KEY NOT NULL,
	"jobId" text NOT NULL,
	"applicant_name" text NOT NULL,
	"email" text NOT NULL,
	"cover_letter" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"company" text NOT NULL,
	"company_website" text NOT NULL,
	"location" text NOT NULL,
	"salary" integer NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobId_job_posts_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."job_posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
