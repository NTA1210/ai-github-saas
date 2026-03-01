"use client";

import { useGetMeetings } from "@/features/meetings/api/get-meetings";
import { useProjectStore } from "@/store/use-project-store";
import MeetingCard from "../dashboard/meeting-card";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const MeetingsPage = () => {
  const { selectedProject } = useProjectStore();

  const { data: meetings, isLoading } = useGetMeetings(selectedProject?.id!);

  // Lưu trạng thái cũ của từng meeting để phát hiện khi nào PROCESSING → COMPLETED
  const prevStatusRef = useRef<Record<string, string>>({});

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

            <div className="">
              <Link href={`/meetings/${meeting.id}`}>
                <Button variant={"outline"}>View Meeting</Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingsPage;
