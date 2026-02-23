"use client";

import { useProjectStore } from "@/store/use-project-store";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";

export default function DashboardPage() {
  const { selectedProject } = useProjectStore();

  if (!selectedProject) return null;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        {/* github link */}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={selectedProject?.githubUrl}
                  target="_blank"
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {selectedProject?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex items-center gap-4">
          Team member InviteButton AchiveButton
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard /> Metting Card
        </div>
      </div>
      <div className="mt-8">
        <CommitLog />
      </div>
    </div>
  );
}
