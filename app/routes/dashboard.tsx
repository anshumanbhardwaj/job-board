import { LoaderFunction, redirect } from "@remix-run/node";
import { getAuth } from "@clerk/remix/ssr.server";
import { Outlet } from "@remix-run/react";
import { useUser } from "@clerk/remix";
import { Separator } from "~/components/ui/separator";

export const loader: LoaderFunction = async (args) => {
  // Use getAuth() to retrieve the user's ID
  const { userId } = await getAuth(args);

  // If there is no userId, then redirect to sign-in route
  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url);
  }

  return {
    userId,
  };
};

export default function Dashboard() {
  const { user } = useUser();
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col px-4 py-10">
      <h1 className="text-3xl font-medium">Dashboard</h1>
      <p>
        Hi {user?.primaryEmailAddress?.emailAddress}, welcome to your hiring
        dashboard.
      </p>
      <Separator className="mt-2 mb-4" />
      <Outlet />
    </div>
  );
}
