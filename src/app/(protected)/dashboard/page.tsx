"use client";

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Handle loading state
  if (!isLoaded) return <div>Loading...</div>;

  // Protect the page from unauthenticated users
  if (!isSignedIn) return <div>Sign in to view this page</div>;

  console.log(user);

  return <div>Hello {user.firstName}!</div>;
}
