"use client";

import { useGetAllCommits } from "@/features/projects/api/use-get-all-commits";
import { useProjectStore } from "@/store/use-project-store";
import CommitLogItem from "./commit-log-item";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import http from "@/utils/http";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const CommitLog = () => {
  const { selectedProject } = useProjectStore();
  const { data: commits } = useGetAllCommits(selectedProject?.id || "");
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState<boolean>(false);
  // Ref tránh trigger summarize nhiều lần cho cùng 1 project
  const autoSummarizedRef = useRef<string | null>(null);

  // Auto-summarize khi vào trang nếu có commit chưa có summary
  useEffect(() => {
    if (!commits || !selectedProject) return;
    const hasUnsummarized = commits.some((c) => c.summary === null);
    if (!hasUnsummarized) return;
    if (autoSummarizedRef.current === selectedProject.id) return;

    autoSummarizedRef.current = selectedProject.id;

    const projectId = selectedProject.id;

    // TODO: update isFirstTimeSetup to false after summarizing
    const isFirstTimeSetup = selectedProject.isFirstTimeSetup;

    toast.promise(
      http.post(`/projects/${projectId}/summarize`).then(() =>
        queryClient.invalidateQueries({
          queryKey: ["commits", projectId],
        }),
      ),
      {
        loading: isFirstTimeSetup
          ? "Summarizing commits..."
          : "Summarizing unsummarized commits...",
        success: "Commits summarized!",
        error: "Failed to summarize",
      },
    );
  }, [commits, selectedProject, queryClient]);

  const handleSync = async () => {
    if (!selectedProject) return;
    setSyncing(true);

    try {
      const res = await http.post<{ count: number; message: string }>(
        `/projects/${selectedProject.id}/commits/sync`,
      );

      if (res.count === 0) {
        toast.info("Already up to date");
        return;
      }

      toast.success(`Found ${res.count} new commit(s)! Summarizing...`);

      // Refetch commits list trước để hiện commit mới (chưa có summary)
      await queryClient.invalidateQueries({
        queryKey: ["commits", selectedProject.id],
      });

      // Trigger summarize cho commit mới
      toast.promise(http.post(`/projects/${selectedProject.id}/summarize`), {
        loading: "Summarizing commits...",
        success: "Commits summarized!",
        error: "Failed to summarize commits",
      });

      // Refetch lần 2 sau khi summarize xong
      await queryClient.invalidateQueries({
        queryKey: ["commits", selectedProject.id],
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {commits?.length ?? 0} commits
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing || !selectedProject}
          className="cursor-pointer"
        >
          <RefreshCw
            className={`mr-2 size-4 ${syncing ? "animate-spin" : ""}`}
          />
          {syncing ? "Syncing..." : "Sync commits"}
        </Button>
      </div>

      <ul className="space-y-6">
        {commits?.map((commit, commitIndex) => (
          <CommitLogItem
            key={commit.id}
            commit={commit}
            isLast={commitIndex === commits.length - 1}
          />
        ))}
      </ul>
    </>
  );
};

export default CommitLog;
