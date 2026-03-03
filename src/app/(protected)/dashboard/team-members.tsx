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
    <div className="flex items-center  -space-x-2">
      {data?.map((member) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <img
              key={member.id}
              src={member.imageUrl || ""}
              alt={member.firstName || ""}
              height={30}
              width={30}
              className="rounded-full outline-1 outline-white"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{member.firstName}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default TeamMembers;
