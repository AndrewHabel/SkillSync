import{
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Award, ExternalLinkIcon, Loader2, PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { useDeleteTask } from "../api/use-delete-tasks";
import { useAutoAssignTask } from "../api/use-auto-assign-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useGetTask } from "../api/use-get-task";
import { useGetTeamsByType } from "@/features/teams/api/use-get-teams-by-type";
import { mapRoleToTeamType } from "@/features/teams/utils/map-role-to-team";
import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter,
    DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
};

export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    
    // State for the reasoning dialog
    const [isReasoningDialogOpen, setIsReasoningDialogOpen] = useState(false);
    const [assignmentReasoning, setAssignmentReasoning] = useState("");
    const [assigneeName, setAssigneeName] = useState("");

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
    });    // Use the auto-assign mutation hook
    const { mutate: autoAssignMutate, isPending: isAutoAssigning } = useAutoAssignTask();      const onAutoAssign = () => {
        if (!taskData) {
            toast.error("Task data not available");
            return;
        }
        
        // Check if the task has a preferred role set
        if (!taskData.preferredRole) {
            toast.error("Task must have a preferred role to use auto-assign", {
                description: "Edit the task to add a preferred role first"
            });
            return;
        }
        
        // Check if the task has any team members
        if (!teamsData || teamsData.documents?.length === 0) {
            toast.error("No team members available for assignment", {
                description: "Add team members with relevant skills first"
            });
            return;
        }
        
        // Call the auto-assign API
        const loadingToast = toast.loading("Finding the best team member for this task...", {
            description: "Our AI is analyzing skills, workloads and performance metrics"
        });
          autoAssignMutate({
            json: {
                taskId: id
            }
        }, {            onSuccess: (data) => {
                toast.dismiss(loadingToast);
                  // Extract the assignment reasoning and assignee name to display in dialog
                const reasoning = data.data.aiReasoning || "No reasoning provided.";
                const name = data.data.assignee?.name || "team member";
                
                // Add a summary tag based on reasoning content (e.g., "Best skill match" or "Balanced workload")
                let enhancedReasoning = reasoning;
                
                // Add a confidence indicator if we can detect certain phrases in the reasoning
                if (reasoning.toLowerCase().includes("most suitable") || 
                    reasoning.toLowerCase().includes("ideal") || 
                    reasoning.toLowerCase().includes("perfect match")) {
                    enhancedReasoning = "🌟 High confidence match\n\n" + reasoning;
                }
                  // Set the state for the dialog
                setAssignmentReasoning(enhancedReasoning);
                setAssigneeName(name);
                setIsReasoningDialogOpen(true);
                
                // Also show a quick success toast with a hint about the dialog
                toast.success(`Task assigned to ${name}!`, {
                    description: "Showing AI reasoning details..."
                });
            },
            onError: () => {
                toast.dismiss(loadingToast);
            }
        });
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
                    </DropdownMenuItem>                    <DropdownMenuItem onClick={onAutoAssign} disabled={isAutoAssigning} className="font-medium p-[10px]">
                        {isAutoAssigning ? (
                            <Loader2 className="size-4 mr-2 stroke-2 animate-spin" />
                        ) : (
                            <Award className="size-4 mr-2 stroke-2" />
                        )}
                        {isAutoAssigning ? "Assigning..." : "Auto Assign"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-amber-700 focus:text-amber-700 font-medium p-[10px]">
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        delete Task
                    </DropdownMenuItem>                </DropdownMenuContent>
            </DropdownMenu>
              {/* Reasoning Dialog */}
            <Dialog open={isReasoningDialogOpen} onOpenChange={setIsReasoningDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center flex items-center justify-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            Assignment Reasoning
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Why <span className="font-semibold text-primary">{assigneeName}</span> was chosen for this task
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4 max-h-[60vh] overflow-y-auto text-sm border border-border rounded-md p-4 bg-muted/30">
                        <p className="whitespace-pre-wrap leading-relaxed">{assignmentReasoning}</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" className="w-full">
                                Got it
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};