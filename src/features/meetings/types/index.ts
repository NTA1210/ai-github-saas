import { Issue, Meeting } from "../../../../generated/prisma/client";

export type GetMeetingDetailResponse = Meeting & {
  issues: Issue[];
};
