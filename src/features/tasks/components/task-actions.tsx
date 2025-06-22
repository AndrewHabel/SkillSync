import{
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle, Award, CheckCircle2, ExternalLinkIcon, Loader2, PencilIcon, TrashIcon } from "lucide-react";
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
import { useEffect, useState } from "react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";
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
import { useGetAllTaskDependencies } from "@/features/TasksDependencies/api/use-get-tasks-dependencies";
import { useProjectId } from "@/features/projects/hooks/use-project-id";


interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
};

export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();    // State for the reasoning dialog
    const [isReasoningDialogOpen, setIsReasoningDialogOpen] = useState(false);
    const [isDependenciesDialogOpen, setIsDependenciesDialogOpen] = useState(false);
    const [assignmentReasoning, setAssignmentReasoning] = useState("");
    const [assigneeName, setAssigneeName] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const paramProjectId = useProjectId();
    // Get current user and members data to check role
    const { data: user } = useCurrent();
    const { data: members } = useGetMembers({ workspaceId });

    const {data: taskDependencies , isLoading: isLoadingDependencies} = useGetAllTaskDependencies({ taskId: id ,workspaceId: workspaceId, projectId: paramProjectId});
    console.log("Task Dependencies lmao awy:", taskDependencies);
    // Check if the current user is an admin
    useEffect(() => {
        if (members && user && Array.isArray(members.documents)) {
            // Find the current user's member document
            const currentUserMember = members.documents.find(member => 
                member.userId === user.$id
            );
            
            if (currentUserMember) {
                setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
            } else {
                setIsAdmin(false);
            }
        }
    }, [members, user, workspaceId]);

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

    const { mutate: autoAssignMutate, isPending: isAutoAssigning } = useAutoAssignTask();

    const onAutoAssign = () => {        

            if ((taskDependencies ?? []).length > 0) {
            console.log("Task has dependencies, cannot auto-assign", taskDependencies);
            setIsDependenciesDialogOpen(true);
            return;
            }

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
        
        // Check if we determined a team type from the preferred role
        if (!teamType) {
            toast.error("No matching team type for this role", {
                description: "The preferred role doesn't match any team type"
            });
            return;
        }
        
        // Check if teams are still loading
        if (isLoadingTeams) {
            toast.error("Still checking team information", {
                description: "Please try again in a moment"
            });
            return;
        }
        
        // Check if the specific team exists for this project
        if (!teamsData || teamsData.data?.documents?.length === 0) {
            toast.error(`No "${teamType}" exists in this project`, {
                description: "Create this team first before using auto-assign"
            });
            return;
        }
        
        // Check if the team has members
        const team = teamsData.data?.documents[0];
        if (!team?.membersId || team.membersId.length === 0) {
            toast.error(`The ${teamType} has no members`, {
                description: "Add team members to this team before using auto-assign"
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
        }, 
        {       onSuccess: (data) => {
                toast.dismiss(loadingToast);                // Extract the assignment reasoning and assignee name to display in dialog
                const reasoning = data.data.aiReasoning || "No reasoning provided.";
                
                // Check if a team member was assigned or not
                const wasAssigned = data.data.assignee && data.data.assigneeId;
                const name = data.data.assignee?.name || "No member assigned";
                  // Add a summary tag based on reasoning content
                let enhancedReasoning = reasoning;
                
                // Format the reasoning if it's not already in bullet points
                if (!reasoning.trim().startsWith("-") && !reasoning.trim().startsWith("•")) {
                    // Convert paragraph to bullet points if needed
                    const sentences = reasoning.split(/(?<=[.!?])\s+/);
                    enhancedReasoning = sentences.map(sentence => {
                        sentence = sentence.trim();
                        return sentence ? `• ${sentence}` : "";
                    }).filter(s => s).join("\n");
                }
                
                // Add a confidence indicator
                if (wasAssigned && (reasoning.toLowerCase().includes("most suitable") || 
                    reasoning.toLowerCase().includes("ideal") || 
                    reasoning.toLowerCase().includes("perfect match") ||
                    reasoning.toLowerCase().includes("excellent fit"))) {
                    enhancedReasoning = "🌟 High confidence match\n\n" + enhancedReasoning;
                } else if (wasAssigned && (reasoning.toLowerCase().includes("good match") ||
                    reasoning.toLowerCase().includes("well suited") ||
                    reasoning.toLowerCase().includes("appropriate choice"))) {
                    enhancedReasoning = "✅ Good match\n\n" + enhancedReasoning;
                } else if (!wasAssigned) {
                    enhancedReasoning = "⚠️ No suitable match found\n\n" + enhancedReasoning;
                }
                  // Set the state for the dialog
                setAssignmentReasoning(enhancedReasoning);
                setAssigneeName(name);
                setIsReasoningDialogOpen(true);
                
                // Show appropriate toast based on assignment status
                if (wasAssigned) {
                    toast.success(`Task assigned to ${name}!`, {
                        description: "Showing AI reasoning details..."
                    });
                } else {
                    toast.warning("No suitable team member found", {
                        description: "Showing AI reasoning details..."
                    });
                }
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
                    </DropdownMenuItem>                    <DropdownMenuItem onClick={onOpenProject} disabled={false} className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>
                    {isAdmin && (
                        <>
                            <DropdownMenuItem onClick={()=>open(id)} disabled={false} className="font-medium p-[10px]">
                                <PencilIcon className="size-4 mr-2 stroke-2" />
                                Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onAutoAssign} disabled={isAutoAssigning} className="font-medium p-[10px]">
                                {isAutoAssigning ? (
                                    <Loader2 className="size-4 mr-2 stroke-2 animate-spin" />
                                ) : (
                                    <Award className="size-4 mr-2 stroke-2" />
                                )}
                                {isAutoAssigning ? "Assigning..." : "Auto Assign"}
                            </DropdownMenuItem>
                        </>
                    )}                    {isAdmin && (
                        <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-amber-700 focus:text-amber-700 font-medium p-[10px]">
                            <TrashIcon className="size-4 mr-2 stroke-2" />
                            Delete Task
                        </DropdownMenuItem>
                    )}</DropdownMenuContent>
            </DropdownMenu>
              {/* Reasoning Dialog */}
            <Dialog open={isReasoningDialogOpen} onOpenChange={setIsReasoningDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center flex items-center justify-center gap-2">
                            {assigneeName !== "No member assigned" ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            )}
                            {assigneeName !== "No member assigned" ? "Assignment Successful" : "No Suitable Match"}
                        </DialogTitle>                        <DialogDescription className="text-center">
                            {assigneeName !== "No member assigned" ? (
                                <>AI selected <span className="font-semibold text-primary">{assigneeName}</span> for this task</>
                            ) : (
                                <>The AI could not find a suitable team member for this task</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4 max-h-[60vh] overflow-y-auto text-sm border border-border rounded-md p-4 bg-muted/30">
                        {assigneeName !== "No member assigned" ? (
                            <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    <h4 className="font-medium">Selected Member</h4>
                                </div>
                                <p className="text-sm ml-6">{assigneeName}</p>
                            </div>
                        ) : (
                            <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <h4 className="font-medium">No Match Found</h4>
                                </div>
                                <p className="text-sm ml-6">Consider adjusting task requirements or adding team members with relevant skills</p>
                            </div>
                        )}
                          <div className="mb-2 font-medium">AI Reasoning:</div>
                        <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground pl-2 border-l-2 border-primary/30 space-y-1">{assignmentReasoning}</div>
                    </div>
                    <DialogFooter className="flex gap-2 justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Close
                            </Button>
                        </DialogClose>                        
                        {isAdmin && assigneeName === "No member assigned" && (
                            <Button onClick={() => {
                                setIsReasoningDialogOpen(false);
                                open(id);
                            }}>
                                <PencilIcon className="size-4 mr-2" />
                                Edit Task
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>            
            </Dialog>            
            <Dialog open={isDependenciesDialogOpen} onOpenChange={setIsDependenciesDialogOpen}>
                <DialogContent className="sm:max-w-xl md:max-w-6xl w-[90vw]">
                    <DialogHeader>
                        <DialogTitle className="text-center flex items-center justify-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Task Dependencies Detected
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            This task has dependencies that must be resolved before it can be auto-assigned
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4 max-h-[60vh] overflow-y-auto text-sm border border-border rounded-md p-4 bg-muted/30">
                        <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
                            <div className="flex items-center gap-2 mb-2">                            
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <h4 className="font-medium">Dependencies Found</h4>
                            </div>
                            <p className="text-sm ml-6">This task <span className="text-red-600">{taskData?.name}</span> depends on {taskDependencies?.length} other tasks that must be completed first.</p>
                        </div>
                        
                        <div className="mb-2 font-medium">Dependent Tasks:</div>
                        <div className="space-y-2">
                            {(taskDependencies ?? []).map((dependency, index) => (
                                <div key={index} className="p-2 bg-muted/50 rounded-md border border-border">
                                    <div className="font-medium">{dependency.name || `Dependency ${index + 1}`}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Depend on : {dependency.dependOnTaskName}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Reason: {dependency.dependReason}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};