import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

export default function NewJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams();
  const baseURL = `/dashboard/${jobId}`;

  const editURL = `${baseURL}/edit`;

  const isEditPage = location.pathname === editURL;

  const applicantsURL = `${baseURL}/applicants`;

  const isApplicantPage = location.pathname === applicantsURL;

  return (
    <div>
      <Button
        onClick={() => navigate("/dashboard")}
        variant={"link"}
        className="w-fit pl-0"
      >
        Go Back
      </Button>
      <div className="flex flex-row space-x-4 mt-2">
        <Link
          className={cn("underline underline-offset-4 text-muted-foreground", {
            "text-primary": isApplicantPage,
          })}
          to={applicantsURL}
        >
          View applicants
        </Link>
        <Link
          className={cn("underline underline-offset-4 text-muted-foreground", {
            "text-primary": isEditPage,
          })}
          to={editURL}
        >
          Edit post
        </Link>
      </div>
      <Separator className="my-4" />
      <Outlet />
    </div>
  );
}
