import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetTeamMembers } from "@/features/projects/api/use-get-team-members";
import { useProjectStore } from "@/store/use-project-store";

const TeamMembers = () => {
  const { selectedProject } = useProjectStore();
  const { data } = useGetTeamMembers(selectedProject?.id || "");

  return (
    <div className="flex items-center -space-x-2">
      {data?.map((member) => (
        <Tooltip key={member.id}>
          <TooltipTrigger asChild>
            <img
              src={member.imageUrl || ""}
              alt={member.firstName || ""}
              height={30}
              width={30}
              className="rounded-full border-2 border-sidebar cursor-pointer hover:z-10 transition-transform duration-200"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {member.emailAddress}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default TeamMembers;
