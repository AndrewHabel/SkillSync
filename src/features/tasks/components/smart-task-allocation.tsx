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
import { Loader2, SparklesIcon, UserIcon, Clock, Award } from "lucide-react";
import { useGetSkills } from "@/features/skill/api/use-get-skills";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getExpertiseLevelDisplay } from "@/features/skill/types";
import { useGetMemberWorkload } from "@/features/members/api/use-get-member-workload";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  
  // Member Skills Component
  const MemberSkills = ({ memberId }: { memberId: string }) => {
    const { data: skillsData, isLoading: isLoadingSkills } = useGetSkills({ 
      workspaceId,
      userId: memberId
    });
    
    const skills = skillsData?.documents || [];
    
    return (
      <div className="mt-2">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
          <Award className="size-3.5 mr-1.5" />
          Skills & Expertise
        </h4>
        
        {isLoadingSkills ? (
          <div className="flex justify-center py-1">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <Badge 
                key={skill.$id} 
                variant="outline"
                className="bg-card text-xs py-1 px-2 flex items-center gap-1.5"
              >
                <span>{skill.skillname}</span>
                <span className="text-xs px-1 py-0.5 bg-primary/10 dark:bg-primary/20 rounded">
                  {getExpertiseLevelDisplay(skill.experienceLevel)}
                </span>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No skills listed</p>
        )}
      </div>
    );
  };

  // Member Workload Component
  const MemberWorkload = ({ memberId }: { memberId: string }) => {
    const { data: workloadData, isLoading: isLoadingWorkload } = useGetMemberWorkload({ 
      workspaceId, 
      memberId,
      projectId: task.projectId 
    });
    
    if (isLoadingWorkload) {
      return (
        <div className="flex justify-center py-1">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (!workloadData) {
      return (
        <p className="text-xs text-muted-foreground italic">Workload data unavailable</p>
      );
    }
    
    // Extract values from the workload data structure
    const { totalHours } = workloadData;
    const { backlog: backlogHours, todo: todoHours, inProgress: inProgressHours, inReview: inReviewHours, done: doneHours } = workloadData.byStatus;
    
    const maxCapacity = 40; // Assuming a standard 40-hour workweek
    const workloadPercentage = Math.min((totalHours / maxCapacity) * 100, 100);
    
    // Determine workload color based on percentage
    const getWorkloadColor = () => {
      if (workloadPercentage > 80) return 'text-red-500';
      if (workloadPercentage > 60) return 'text-amber-500';
      return 'text-green-500';
    };

    const getProgressColor = () => {
      if (workloadPercentage > 80) return 'bg-red-500';
      if (workloadPercentage > 60) return 'bg-amber-500';
      return 'bg-green-500';
    };
    
    return (
      <div className="mt-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
          <Clock className="size-3.5 mr-1.5" />
          Current Workload
        </h4>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span>{Math.round(totalHours)} hours assigned</span>
            <span className={getWorkloadColor()}>
              {Math.round(workloadPercentage)}%
            </span>
          </div>
          
          <Progress 
            value={workloadPercentage} 
            className="h-2" 
            indicatorClassName={getProgressColor()}
          />
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="workload-details" className="border-none">
              <AccordionTrigger className="py-1 text-xs text-muted-foreground">
                Workload details
              </AccordionTrigger>
              <AccordionContent className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>In Progress:</span>
                  <span>{inProgressHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>To Do:</span>
                  <span>{todoHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>In Review:</span>
                  <span>{inReviewHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Backlog:</span>
                  <span>{backlogHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span>{doneHours} hours</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
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
      </DialogTrigger>      <DialogContent className="sm:max-w-[525px]">
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
              <div className="max-h-[500px] overflow-y-auto">
                {teamMembers.map((member) => (
                  <div
                    key={member.$id}
                    className="flex flex-col p-4 hover:bg-muted/50 rounded-md mb-3 border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-x-3">
                        <MembersAvatar name={member.name} className="size-10" />
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="solid"
                        className="ml-auto"
                        onClick={() => handleAssignTask(member.$id)}
                        disabled={isLoading && selectedMemberId === member.$id}
                      >
                        {isLoading && selectedMemberId === member.$id ? (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        ) : (
                          <UserIcon className="size-4 mr-2" />
                        )}
                        Assign
                      </Button>
                    </div>
                    
                    <div className="mt-3 border-t pt-3 space-y-3">
                      <MemberSkills memberId={member.$id} />
                      <MemberWorkload memberId={member.$id} />
                    </div>
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
