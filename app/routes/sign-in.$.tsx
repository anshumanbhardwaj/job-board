import { SignIn } from "@clerk/remix";

export default function SignInPage() {
  return (
    <div className="w-full h-full flex items-center justify-center mt-20">
      <SignIn />
    </div>
  );
}
