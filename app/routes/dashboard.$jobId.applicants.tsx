import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { db } from "~/db.server";
import { jobApplicationsTable, jobPostsTable } from "~/db.server/schema";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  const applicants = await db
    .select()
    .from(jobApplicationsTable)
    .innerJoin(jobPostsTable, eq(jobApplicationsTable.jobId, jobPostsTable.id))
    .where(and(eq(jobPostsTable.userId, String(userId))));
  return { applicants };
}

export default function NewJob() {
  const { applicants } = useLoaderData<typeof loader>();
  const { jobId } = useParams();
  return (
    <div>
      <h1 className="text-2xl">Applicants</h1>

      {applicants.length ? (
        <div className="grid grid-cols-2 gap-4 mt-10">
          {" "}
          {applicants.map(({ job_applications: applicant }) => (
            <Card key={applicant.id}>
              <CardHeader className="relative">
                <Button
                  asChild
                  className="absolute right-2 top-4 w-fit"
                  variant={"outline"}
                >
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    to={`/dashboard/${jobId}/${applicant.id}/resume`}
                    download={`${applicant.email}.pdf`}
                  >
                    Download resume
                  </Link>
                </Button>

                <CardTitle>{applicant.applicantName}</CardTitle>
                <CardDescription className="flex flex-row space-x-4">
                  <span>{applicant.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{applicant.coverLetter}</p>
                <p className="text-muted-foreground text-xs">
                  Applied on {new Date(applicant.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No applications yet</p>
      )}
    </div>
  );
}
