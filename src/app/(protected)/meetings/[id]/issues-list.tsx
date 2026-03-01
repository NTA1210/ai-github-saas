import { Issue } from "../../../../../generated/prisma/client";
import IssueCard from "./issue-card";

type Props = {
  issues: Issue[];
};

const IssuesList = ({ issues }: Props) => {
  if (issues.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No issues found. The meeting may still be processing.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
};

export default IssuesList;
