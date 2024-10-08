import { ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  redirect,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { db } from "~/db.server";
import { JobPost, jobPostsTable } from "~/db.server/schema";
import { nanoid } from "nanoid";
import { getAuth } from "@clerk/remix/ssr.server";

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/sign-in");
  }
  const { request } = args;
  const body = await request.formData();

  const jobId = `job_${nanoid(16)}`;
  try {
    await db.insert(jobPostsTable).values({
      id: jobId,
      title: body.get("title"),
      description: body.get("description"),
      company: body.get("company"),
      companyWebsite: body.get("company_website"),
      userId,
      location: body.get("location"),
      salary: Number(body.get("salary")),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as JobPost);
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
  return (
    <div>
      <Button
        onClick={() => navigate("/dashboard")}
        variant={"link"}
        className="w-fit pl-0"
      >
        Go Back
      </Button>
      <h1 className="text-2xl">New job post</h1>
      <Form method="post" className="flex flex-col gap-4 mt-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            name="title"
            placeholder="Software engineer"
            type="text"
            required
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            rows={30}
            name="description"
            placeholder="Job description (with markdown formatting)"
            required
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="company">Company</Label>

          <Input name="company" placeholder="Railway" type="text" required />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="company_website">Company website</Label>
          <Input
            name="company_website"
            placeholder="https://railway.app"
            type="url"
            required
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="location">Location</Label>

          <Input name="location" placeholder="Remote" type="text" required />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="salary">Salary ($ per month)</Label>

          <Input
            name="salary"
            placeholder="3000"
            type="number"
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
            {navigation.state === "submitting" ? "Submitting..." : "Submit"}
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
