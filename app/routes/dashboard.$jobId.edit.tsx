import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/db.server";
import { JobPost, jobPostsTable } from "~/db.server/schema";

import { getAuth } from "@clerk/remix/ssr.server";
import { eq } from "drizzle-orm";

export async function loader(args: LoaderFunctionArgs) {
  const jobs = await db
    .select()
    .from(jobPostsTable)
    .where(eq(jobPostsTable.id, String(args.params.jobId)))
    .limit(1);

  if (jobs.length === 0) {
    throw new Response("Job not found", { status: 404 });
  }

  return { job: jobs[0] };
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const { request } = args;
  const body = await request.formData();
  const jobId = String(args.params.jobId);
  try {
    await db
      .update(jobPostsTable)
      .set({
        title: body.get("title"),
        description: body.get("description"),
        company: body.get("company"),
        companyWebsite: body.get("company_website"),
        location: body.get("location"),
        salary: Number(body.get("salary")),
        updatedAt: new Date().toISOString(),
      } as JobPost)
      .where(eq(jobPostsTable.id, jobId));
    return redirect(`/jobs/${jobId}`);
  } catch (error) {
    console.log({ error });
    return {
      error: "Something went wrong!",
    };
  }
}

export default function NewJob() {
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { job } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-2xl">Edit job post</h1>
      <Form method="post" className="flex flex-col gap-4 mt-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            name="title"
            placeholder="Software engineer"
            type="text"
            required
            defaultValue={job.title}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            rows={30}
            name="description"
            placeholder="Job description (with markdown formatting)"
            required
            defaultValue={job.description}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="company">Company</Label>

          <Input
            defaultValue={job.company}
            name="company"
            placeholder="Railway"
            type="text"
            required
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="company_website">Company website</Label>
          <Input
            defaultValue={job.companyWebsite}
            name="company_website"
            placeholder="https://railway.app"
            type="url"
            required
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="location">Location</Label>

          <Input
            defaultValue={job.location}
            name="location"
            placeholder="Remote"
            type="text"
            required
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="salary">Salary ($ per month)</Label>

          <Input
            name="salary"
            placeholder="3000"
            type="number"
            defaultValue={job.salary}
            min={1}
            required
          />
        </div>
        {actionData?.error && (
          <p className="text-red-500">{actionData?.error}</p>
        )}
        <div className="flex flex-row space-x-4">
          <Button
            type="submit"
            disabled={navigation.state !== "idle"}
            className="w-fit"
          >
            {navigation.state === "submitting" ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant={"link"}
            className="w-fit"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
