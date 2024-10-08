import { Link, useLoaderData } from "@remix-run/react";
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

export async function loader() {
  const jobs = await db.select().from(jobPostsTable);
  return { jobs };
}
export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="p-4 py-10 flex flex-col w-full max-w-6xl mx-auto">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-medium">All Jobs</h1>
        <Button asChild>
          <Link to="/dashboard/new">Post a job</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-10">
        {data.jobs.map((job) => (
          <Link to={`/jobs/${job.id}`} key={job.id}>
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
        ))}
      </div>
    </div>
  );
}
