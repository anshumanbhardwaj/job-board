import { LoaderFunction, redirect } from "@remix-run/node";
import { getAuth } from "@clerk/remix/ssr.server";
import { Outlet } from "@remix-run/react";

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
  return (
    <div>
      Dashboard
      <Outlet />
    </div>
  );
}
