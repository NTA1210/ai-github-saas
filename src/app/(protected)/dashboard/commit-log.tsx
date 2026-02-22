import { useGetAllCommits } from "@/features/projects/api/use-get-all-commits";
import { useProjectStore } from "@/store/use-project-store";
import CommitLogItem from "./commit-log-item";

const CommitLog = () => {
  const { selectedProject } = useProjectStore();
  const { data: commits } = useGetAllCommits(selectedProject?.id || "");

  return (
    <>
      <ul className="space-y-6">
        {commits?.map((commit, commitIndex) => {
          return (
            <CommitLogItem
              key={commit.id}
              commit={commit}
              isLast={commitIndex === commits.length - 1}
            />
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
