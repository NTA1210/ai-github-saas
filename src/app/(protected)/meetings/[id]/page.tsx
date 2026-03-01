import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import IssuesList from "./issues-list";
import { VideoIcon } from "lucide-react";

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
    <div className="p-8">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:max-w-none">
        <div className="flex items-center gap-x-6">
          <div className="rounded-full border bg-white p-3">
            <VideoIcon className="size-6" />
          </div>
          <h1>
            <div className="text-sm leading-6 text-gray-600">
              Meeting on {""}
              {new Date(meeting.createdAt).toLocaleDateString()}
            </div>
            <div className="mt-1 text-base font-semibold leading-6 text-gray-900">
              {meeting.name}
            </div>
          </h1>
        </div>
      </div>

      <div className="h-4"></div>

      <IssuesList issues={meeting.issues} />
    </div>
  );
};

export default MeetingDetailPage;
