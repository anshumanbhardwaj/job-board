import { SignUp } from "@clerk/remix";

export default function SignUpPage() {
  return (
    <div className="w-full h-full flex items-center justify-center mt-20">
      <SignUp />
    </div>
  );
}
