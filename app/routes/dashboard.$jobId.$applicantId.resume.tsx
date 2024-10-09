import { LoaderFunctionArgs } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { db } from "~/db.server";
import { jobApplicationsTable } from "~/db.server/schema";
import { readFile } from "fs/promises";
export async function loader(args: LoaderFunctionArgs) {
  const { jobId, applicantId } = args.params;

  const application = await db
    .select()
    .from(jobApplicationsTable)
    .where(
      and(
        eq(jobApplicationsTable.id, String(applicantId)),
        eq(jobApplicationsTable.jobId, String(jobId))
      )
    )
    .limit(1);

  if (application.length === 0) {
    throw new Response("Job or application not found", { status: 404 });
  }

  const resume = await readFile(`resumes/${jobId}/${application[0].id}.pdf`);

  return new Response(resume, {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
