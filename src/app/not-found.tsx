import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-4 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="flex size-20 items-center justify-center rounded-full bg-indigo-100">
          <FileQuestion className="size-10 text-indigo-500" />
        </div>

        {/* 404 */}
        <div className="space-y-2">
          <p className="text-7xl font-black text-indigo-200 select-none">404</p>
          <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            The page you were looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action */}
        <Button asChild className="gap-2">
          <Link href="/dashboard">
            <Home className="size-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
