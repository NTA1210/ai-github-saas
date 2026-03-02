"use client";

import { useGetMeetings } from "@/features/meetings/api/get-meetings";
import { useProjectStore } from "@/store/use-project-store";
import MeetingCard from "../dashboard/meeting-card";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDeleteMeeting } from "@/features/meetings/api/delete-meeting";
import useRefetch from "@/hooks/useRefetch";
import NoProjectSelected from "@/components/ui/no-project-selected";

const MeetingsPage = () => {
  const { selectedProject } = useProjectStore();

  const { data: meetings, isLoading } = useGetMeetings(selectedProject?.id!);

  // Lưu trạng thái cũ của từng meeting để phát hiện khi nào PROCESSING → COMPLETED
  const prevStatusRef = useRef<Record<string, string>>({});
  const { mutateAsync: deleteMeeting } = useDeleteMeeting();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const refetch = useRefetch({
    targetQueryKey: ["meetings", selectedProject?.id],
  });

  useEffect(() => {
    if (!meetings) return;

    meetings.forEach((meeting) => {
      const prevStatus = prevStatusRef.current[meeting.id];
      const currentStatus = meeting.status;

      // Chỉ toast khi status VỪA chuyển từ PROCESSING → COMPLETED
      // (prevStatus tồn tại = không phải lần mount đầu tiên)
      if (prevStatus === "PROCESSING" && currentStatus === "COMPLETED") {
        toast.success(`✅ "${meeting.name}" has been processed!`, {
          description: `Found ${meeting.issues?.length ?? 0} issues`,
          duration: 5000,
          action: {
            label: "View now",
            onClick: () => {
              window.location.href = `/meetings/${meeting.id}`;
            },
          },
        });
      }

      // Cập nhật ref cho lần tiếp theo
      prevStatusRef.current[meeting.id] = currentStatus;
    });
  }, [meetings]);

  // Dừng polling khi tất cả meetings đã xong (không còn PROCESSING)
  const hasProcessing = meetings?.some((m) => m.status === "PROCESSING");

  const handleDeleteMeeting = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteMeeting(id);
        toast.success("Meeting deleted");
        await refetch();
      } catch {
        toast.error("Failed to delete meeting");
      } finally {
        setDeletingId(null);
      }
    },
    [deleteMeeting, refetch],
  );

  if (!selectedProject) {
    return (
      <div className="flex flex-col gap-6">
        <div className="opacity-40 pointer-events-none select-none">
          <MeetingCard />
        </div>
        <NoProjectSelected
          title="No project selected"
          description="Select a project from the sidebar to view and manage meetings."
        />
      </div>
    );
  }

  return (
    <div>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>

      {/* Hiển thị banner khi có meeting đang xử lý */}
      {hasProcessing && (
        <div className="flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800 mb-4">
          <Spinner className="size-4" />
          <span>
            Processing audio... The page will automatically update when
            finished.
          </span>
        </div>
      )}

      {meetings && meetings.length === 0 && (
        <p className="text-muted-foreground">No meetings found</p>
      )}
      {isLoading && <Spinner />}
      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between py-5 gap-x-6"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    {meeting.name}
                  </Link>

                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-yellow-500 text-white animate-pulse">
                      Processing...
                    </Badge>
                  )}
                  {meeting.status === "COMPLETED" && (
                    <Badge className="bg-green-500 text-white">Completed</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-x-2">
                <p className="whitespace-nowrap">
                  {new Date(meeting.createdAt).toLocaleDateString()}
                </p>
                <p className="truncate">
                  {meeting?.issues?.length || 0} issues
                </p>
              </div>
            </div>

            <div className="flex items-center gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button
                  size={"sm"}
                  variant={"outline"}
                  disabled={
                    meeting.status === "PROCESSING" || deletingId === meeting.id
                  }
                >
                  View Meeting
                </Button>
              </Link>
              <Button
                size={"sm"}
                variant={"destructive"}
                disabled={deletingId === meeting.id}
                onClick={() => handleDeleteMeeting(meeting.id)}
              >
                {deletingId === meeting.id && (
                  <Spinner className="mr-2 size-4" />
                )}
                Delete Meeting
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingsPage;
