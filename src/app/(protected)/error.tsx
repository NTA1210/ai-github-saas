"use client";

import { toast } from "sonner";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  if (error) toast.error(error.message);
  return (
    <div>
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
