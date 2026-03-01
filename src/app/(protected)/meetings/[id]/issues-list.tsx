import { Issue } from "../../../../../generated/prisma/client";

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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Issues ({issues.length})</h2>
      <ul className="space-y-3">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <p className="font-medium text-gray-900">{issue.headline}</p>
                <p className="text-sm text-muted-foreground">{issue.gist}</p>
                <p className="text-sm text-gray-600">{issue.summary}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                {issue.start} – {issue.end}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssuesList;
