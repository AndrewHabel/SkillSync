import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Task } from "../types";
import { useGetTeamsByType } from "@/features/teams/api/use-get-teams-by-type";
import { mapRoleToTeamType } from "@/features/teams/utils/map-role-to-team";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { useUpdateTask } from "../api/use-update-tasks";
import { toast } from "sonner";
import { Loader2, SparklesIcon, UserIcon } from "lucide-react";

interface SmartTaskAllocationProps {
  task: Task;
  onAssigneeUpdated?: () => void;
}

export const SmartTaskAllocation = ({ task, onAssigneeUpdated }: SmartTaskAllocationProps) => {
  const workspaceId = useWorkspaceId();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const { mutate: updateTask } = useUpdateTask();

  // Map the preferred role to team type
  const teamType = mapRoleToTeamType(task.preferredRole);

  // Fetch teams that match the preferred role
  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsByType({
    workspaceId,
    projectId: task.projectId || "",
    teamtype: teamType
  });

  // Extract all team members from the matching teams
  const teamMembers = teamsData?.data?.documents?.flatMap(team => 
    team.membersList || []
  ) || [];

  // Function to handle the assignment of a task to a member
  const handleAssignTask = (memberId: string) => {
    setIsLoading(true);
    setSelectedMemberId(memberId);

    updateTask(
      {
        param: { taskId: task.$id },
        json: { assigneeId: memberId }
      },
      {
        onSuccess: () => {
          toast.success("Task assigned successfully!");
          setIsOpen(false);
          setIsLoading(false);
          if (onAssigneeUpdated) {
            onAssigneeUpdated();
          }
        },
        onError: (err) => {
          toast.error("Failed to assign task");
          setIsLoading(false);
          console.error("Error assigning task:", err);
        }
      }
    );
  };

  // If there's no preferred role, disable the button
  if (!task.preferredRole) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-x-1.5 text-muted-foreground"
          >
            <SparklesIcon className="size-3.5" />
            Smart Allocation
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="p-2 text-sm text-muted-foreground">
            Smart Allocation requires a preferred role to be set.
            Edit the task to set a preferred role.
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // If there's no project assigned to the task, disable the button
  if (!task.projectId) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-x-1.5 text-muted-foreground"
          >
            <SparklesIcon className="size-3.5" />
            Smart Allocation
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="p-2 text-sm text-muted-foreground">
            Smart Allocation requires the task to be assigned to a project.
            Edit the task to assign it to a project.
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-x-1.5 text-primary"
        >
          <SparklesIcon className="size-3.5" />
          Smart Allocation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Smart Task Allocation</DialogTitle>
          <DialogDescription>
            Assign this task to a team member with the appropriate skills.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoadingTeams ? (
            <div className="flex justify-center p-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted-foreground">
              No team members found that match the preferred role: <span className="font-medium">{teamType}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2">
                Team members from <span className="font-semibold">{teamType}</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {teamMembers.map((member) => (
                  <div
                    key={member.$id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                    onClick={() => handleAssignTask(member.$id)}
                  >
                    <div className="flex items-center gap-x-2">
                      <MembersAvatar name={member.name} className="size-7" />
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      disabled={isLoading && selectedMemberId === member.$id}
                    >
                      {isLoading && selectedMemberId === member.$id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserIcon className="size-4" />
                      )}
                      <span className="sr-only">Assign</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
