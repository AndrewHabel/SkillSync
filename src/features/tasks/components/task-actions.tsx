import{
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Award, ExternalLinkIcon, Loader2, PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { useDeleteTask } from "../api/use-delete-tasks";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useGetTask } from "../api/use-get-task";
import { useGetTeamsByType } from "@/features/teams/api/use-get-teams-by-type";
import { mapRoleToTeamType } from "@/features/teams/utils/map-role-to-team";
import { useGetSkills } from "@/features/skill/api/use-get-skills";
import { useState, useEffect } from "react";
import { Skill } from "@/features/skill/types";
import { getExpertiseLevelDisplay } from "@/features/skill/types";


interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
};

// New interface to represent team members with their skills
interface TeamMemberWithSkills {
    $id: string;
    name?: string;
    email?: string;
    skills?: Skill[];
    [key: string]: any; // For other properties in team members
}

export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    // State to store team members with skills
    const [teamMembersWithSkills, setTeamMembersWithSkills] = useState<TeamMemberWithSkills[]>([]);

    const {open} = useEditTaskModal();

    const [ConfirmDialog,confirm] = useConfirm(
        "Are you sure you want to delete this task?",
        "This Action cannot be undone",
        "destructive"
    );

    const {mutate,isPending} = useDeleteTask();

    const handleDelete = async () => {
        const ok = await confirm();
        if(!ok) return;
        mutate({param: {taskId: id}});
    };

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`)
    };    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`)
    };
    
    // Use the hook at component level to fetch task data
    const { data: taskData } = useGetTask({ taskId: id });

    const teamType = mapRoleToTeamType(taskData?.preferredRole);

    const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsByType({
        workspaceId,
        projectId: taskData?.projectId || "",
        teamtype: teamType,
    });

    const onAutoAssign = () => {
        if (taskData) {
            console.log("Full task data:", taskData);
            console.log("Teams data:", teamsData);
        } else {
            console.log("Task data not yet available");
        }
    };

    return(
        <div className="flex justify-end">
            <ConfirmDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={onOpenTask} disabled={false} className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenProject} disabled={false} className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>open(id)} disabled={false} className="font-medium p-[10px]">
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>                    <DropdownMenuItem onClick={onAutoAssign} disabled={false} className="font-medium p-[10px]">
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Auto Assign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-amber-700 focus:text-amber-700 font-medium p-[10px]">
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};