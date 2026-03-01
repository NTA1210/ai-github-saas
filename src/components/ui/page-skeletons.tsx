import { Skeleton } from "@/components/ui/skeleton";

// ─── Dashboard Skeleton ────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* GitHub link bar */}
      <Skeleton className="h-12 w-2/3 rounded-lg" />

      {/* Cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <Skeleton className="sm:col-span-3 h-40 rounded-xl" />
        <Skeleton className="sm:col-span-2 h-40 rounded-xl" />
      </div>

      {/* Commit log header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Commit items */}
      <ul className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex gap-4">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── QA Page Skeleton ─────────────────────────────────────────────
export function QASkeleton() {
  return (
    <div className="space-y-4">
      {/* Ask question card */}
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-6 w-40" />

      {/* Question items */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border"
        >
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Meetings Page Skeleton ────────────────────────────────────────
export function MeetingsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Meeting upload card */}
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-6 w-32" />

      {/* Meeting list items */}
      <ul className="divide-y divide-gray-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between py-5 gap-x-6"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Generic Full-page loader (route-level loading.tsx) ────────────
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="size-16 rounded-full border-4 border-muted animate-pulse" />
        {/* Spinning arc */}
        <div className="absolute inset-0 size-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  );
}
