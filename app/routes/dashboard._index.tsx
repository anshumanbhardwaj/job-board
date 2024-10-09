import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { db } from "~/db.server";
import { jobPostsTable } from "~/db.server/schema";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  const jobs = await db
    .select()
    .from(jobPostsTable)
    .where(eq(jobPostsTable.userId, String(userId)));
  return { jobs };
}
export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-2xl font-medium">All Jobs</h2>
        <Button asChild>
          <Link to="/dashboard/new">Post a job</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-10">
        {data.jobs.length ? (
          data.jobs.map((job) => (
            <Link to={`/dashboard/${job.id}`} key={job.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription className="flex flex-row space-x-4">
                    <span>{job.company}</span>
                    <span>{job.location}</span>
                    <span>${job.salary} / month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-xs">
                    Posted on {new Date(job.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p>No jobs to show.</p>
        )}
      </div>
    </div>
  );
}
