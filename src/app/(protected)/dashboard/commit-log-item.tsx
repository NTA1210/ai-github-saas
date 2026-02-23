"use client";

import { useProjectStore } from "@/store/use-project-store";
import { Commit } from "../../../../generated/prisma/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type CommitLogItemProps = {
  commit: Commit;
  isLast: boolean;
};

const CommitLogItem = ({ commit, isLast }: CommitLogItemProps) => {
  const { selectedProject } = useProjectStore();

  return (
    <li key={commit.id} className="relative flex gap-x-4">
      <div
        className={cn(
          isLast ? "h-6" : "-bottom-6",
          "absolute left-0 top-0 flex w-6 justify-center",
        )}
      >
        <div className="w-px translate-x-1 bg-gray-200" />
      </div>

      <>
        <img
          src={commit.commitAuthorAvatar}
          alt="commit avatar"
          className="mt-4 size-8 flex-none rounded-full bg-gray-50 border border-gray-200 z-10"
        />
        <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
          <div className="flex justify-between gap-x-4">
            <Link
              target="_blank"
              href={`${selectedProject?.githubUrl}/commit/${commit.commitHash}`}
              className="py-0.5 text-xs elading-5"
            >
              <span className="font-medium text-gray-900">
                {commit.commitAuthorName}
              </span>{" "}
              <span className="inline-flex items-center">
                commited
                <ExternalLink className="ml-1 size-4" />
              </span>
            </Link>
            <time
              dateTime={commit.commitDate}
              className="text-xs text-muted-foreground"
            >
              {new Date(commit.commitDate).toLocaleString()}
            </time>
          </div>
          <span className="font-semibold">{commit.commitMessage}</span>
          <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-500">
            {commit.summary}
          </pre>
        </div>
      </>
    </li>
  );
};

export default CommitLogItem;
