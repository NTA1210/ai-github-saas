import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import IssuesList from "./issues-list";

const MeetingDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { issues: true },
  });

  if (!meeting) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{meeting.name}</h1>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            meeting.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {meeting.status}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        {new Date(meeting.createdAt).toLocaleString()}
      </p>

      <IssuesList issues={meeting.issues} />
    </div>
  );
};

export default MeetingDetailPage;
