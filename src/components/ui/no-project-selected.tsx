"use client";

import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

interface NoProjectSelectedProps {
  title?: string;
  description?: string;
}

const NoProjectSelected = ({
  title = "No project selected",
  description = "Select a project from the sidebar or create a new one to get started.",
}: NoProjectSelectedProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <div className="rounded-full bg-primary/10 p-4">
        <FolderOpen className="size-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Link href="/create">
        <Button className="mt-2 cursor-pointer">
          <Plus className="size-4 mr-1" />
          Create a Project
        </Button>
      </Link>
    </div>
  );
};

export default NoProjectSelected;
