import { getAuth } from "@clerk/remix/ssr.server";
import { Label } from "@radix-ui/react-label";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/db.server";
import {
  JobApplication,
  jobApplicationsTable,
  jobPostsTable,
} from "~/db.server/schema";
import showdown from "showdown";

const converter = new showdown.Converter();

export async function loader(args: LoaderFunctionArgs) {
  const jobs = await db
    .select()
    .from(jobPostsTable)
    .where(eq(jobPostsTable.id, String(args.params.jobId)))
    .limit(1);

  if (jobs.length === 0) {
    throw new Response("Job not found", { status: 404 });
  }

  const job = jobs[0];

  const content = converter.makeHtml(job.description);

  return { job: { ...job, content } };
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const { request } = args;
  const jobId = args.params.jobId;
  const appId = `app_${nanoid(16)}`;

  const standardFileUploadHandler = unstable_createFileUploadHandler({
    directory: `resumes`,
    file: () => `${jobId}/${appId}.pdf`, // return unique file name
  });

  const uploadHandler = unstable_composeUploadHandlers(
    standardFileUploadHandler,
    unstable_createMemoryUploadHandler()
  );

  const body = await unstable_parseMultipartFormData(request, uploadHandler);

  try {
    await db.insert(jobApplicationsTable).values({
      id: appId,
      applicantName: body.get("name"),
      coverLetter: body.get("cover_letter"),
      email: body.get("email"),
      jobId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as JobApplication);
    return { message: "Your application has been submitted!", error: "" };
  } catch (error) {
    console.log({ error });
    return {
      error: "Something went wrong!",
      message: "",
    };
  }
}

export default function JobDetailsPage() {
  const { job } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div className="p-4 py-10 flex flex-col w-full max-w-6xl mx-auto">
      <Link to="/">Go back</Link>
      <h1 className="text-3xl font-medium mt-4">{job.title}</h1>
      <div className="flex flex-row space-x-4 mt-2">
        <a
          href={job.companyWebsite}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          {job.company}
        </a>
        <span>{job.location}</span>
        <span>${job.salary} / month</span>
      </div>
      <span className="text-xs my-2">
        Posted on {new Date(job.createdAt).toLocaleString()}
      </span>
      <Separator className="my-2" />
      <div
        className="prose mt-4"
        dangerouslySetInnerHTML={{ __html: job.content }}
      />
      <Separator className="my-4" />
      <h3 className="text-2xl">Apply for this role</h3>
      {actionData?.message ? (
        <p className="text-green-700 my-4">{actionData?.message}</p>
      ) : (
        <Form
          method="post"
          className="flex flex-col gap-4 mt-4"
          encType="multipart/form-data"
        >
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input name="name" placeholder="Jane Doe" type="text" required />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="cover_letter">Cover letter</Label>
            <Textarea
              rows={10}
              name="cover_letter"
              placeholder="Why do you want to join?"
              required
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="resume">Resume </Label>
            <Input
              id="resume"
              name="resume"
              type="file"
              accept=".pdf"
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
              {navigation.state === "submitting" ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
