import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo / branding */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/logo.png"
              alt="AI Github Logo"
              width={36}
              height={36}
              className="rounded-lg object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Github AI</span>
          </div>
          <p className="text-sm text-gray-500">
            AI-powered GitHub analysis platform
          </p>
        </div>

        <SignUp />
      </div>
    </div>
  );
}
