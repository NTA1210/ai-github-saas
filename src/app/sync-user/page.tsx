"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { syncUserToDb } from "./action";

const SyncUser = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;

    if (hasSynced.current) return;
    hasSynced.current = true;

    syncUserToDb()
      .catch((err) => {
        console.error("[sync-user] Failed to sync:", err);
      })
      .finally(() => {
        router.replace("/dashboard");
      });
  }, [isLoaded, isSignedIn, userId, router]);

  // Loading screen trong lúc đợi sync
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Setting up your account...
        </p>
      </div>
    </div>
  );
};

export default SyncUser;
