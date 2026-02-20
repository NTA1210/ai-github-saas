"use client";

import { UserButton, useUser } from "@clerk/nextjs";

const UserButtonWithLoading = () => {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-7 w-7 rounded-full bg-muted-foreground animate-pulse" />
    );
  }

  return <UserButton />;
};

export default UserButtonWithLoading;
