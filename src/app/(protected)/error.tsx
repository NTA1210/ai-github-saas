"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log lỗi để debug (không toast trong error boundary vì có thể gây vòng lặp)
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      {/* Icon */}
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="size-8 text-red-500" />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        {/* <p className="text-sm text-muted-foreground max-w-sm">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p> */}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="default" className="gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard">
            <Home className="size-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>

      {/* Error detail (chỉ hiện ở dev) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 w-full max-w-lg text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-gray-700">
            Error details (dev only)
          </summary>
          <pre className="mt-2 overflow-auto rounded-md bg-gray-100 p-4 text-xs text-red-600">
            {error?.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
