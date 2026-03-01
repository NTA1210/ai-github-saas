"use client";

import { useGetMeetings } from "@/features/meetings/api/get-meetings";
import { useProjectStore } from "@/store/use-project-store";
import MeetingCard from "../dashboard/meeting-card";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MeetingsPage = () => {
  const { selectedProject } = useProjectStore();

  const { data: meetings, isLoading } = useGetMeetings(selectedProject?.id!);

  return (
    <div>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>
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
                    <Badge className="bg-yellow-500 text-white">
                      Processing...
                    </Badge>
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
