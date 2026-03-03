"use client";

import { useProjectStore } from "@/store/use-project-store";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { getProjectById } from "@/features/projects/api/use-get-project";
import { useRouter } from "next/navigation";
import NoProjectSelected from "@/components/ui/no-project-selected";
import TeamMembers from "./team-members";

export default function DashboardPage() {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get("error-code");
  const projectId = searchParams.get("project-id");

  useEffect(() => {
    if (errorCode === "already-joined" && projectId) {
      getProjectById(projectId).then(({ project }) => {
        if (project) {
          setSelectedProject(project);
          toast.info("You are already a member of this project");
        }
        router.replace("/dashboard");
      });
    }
  }, [errorCode, projectId, setSelectedProject, router]);

  // ─── Empty State — chưa có project nào ───────────────────────────────────
  if (!selectedProject) {
    return (
      <div className="flex flex-col gap-6">
        {/* Cards hiển thị nhưng bị mờ và không click được */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 opacity-40 pointer-events-none select-none">
          <AskQuestionCard />
          <MeetingCard />
        </div>
        <NoProjectSelected />
      </div>
    );
  }

  // ─── Full Dashboard — đã có project ──────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        {/* Github link */}
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
          <TeamMembers /> <InviteButton /> <ArchiveButton />
        </div>
      </div>

      {/* Cards */}
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard /> <MeetingCard />
        </div>
      </div>

      {/* Commit log — chỉ hiện khi có project */}
      <div className="mt-8">
        <CommitLog />
      </div>
    </div>
  );
}
