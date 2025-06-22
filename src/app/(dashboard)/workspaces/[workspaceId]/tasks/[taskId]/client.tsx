"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { TaskBreadCrumbs } from "@/features/tasks/components/task-bread-crumbs";
import { TaskCodeGenerator } from "@/features/tasks/components/task-code-generator";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { useGetAllTaskDependencies } from "@/features/TasksDependencies/api/use-get-tasks-dependencies";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEffect, useState } from "react";
import { Link as LinkIcon } from "lucide-react";

export const TaskIdClient = () => {
    const taskId = useTaskId();
    const workspaceId = useWorkspaceId();
    const { data, isLoading } = useGetTask({ taskId });
    const { data: currentUser } = useCurrent();
    const { data: members } = useGetMembers({ workspaceId });
    const [isAssignedToCurrentUser, setIsAssignedToCurrentUser] = useState(false);
    
    const {data: tasksDependencies, isLoading: isLoadingDependencies} = useGetAllTaskDependencies({taskId: taskId,workspaceId: workspaceId, projectId: data?.projectId});
    
    console.log("Task Dependencies:", tasksDependencies);

    // Check if the current user is the assignee of this task
    useEffect(() => {
        if (data && currentUser && members && Array.isArray(members.documents)) {
            // Find the current user's member entry
            const currentUserMember = members.documents.find(member => 
                member.userId === currentUser.$id
            );
            
            // Check if the current member's ID matches the task's assigneeId
            if (currentUserMember) {
                setIsAssignedToCurrentUser(data.assigneeId === currentUserMember.$id);
            } else {
                setIsAssignedToCurrentUser(false);
            }
        }
    }, [data, currentUser, members]);

    if (isLoading) return <PageLoader />;

    if(!data) return <PageError message = "Task Not Found"/>;    return (
        <div className="flex flex-col">
            {data.project && <TaskBreadCrumbs project={data.project} task={data} />}
            <DottedSeparator className="my-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TaskOverview task={data} />
                <TaskDescription task={data} />
            </div>            <DottedSeparator className="my-6" />
            
            {/* Task Dependencies Section */}
            {tasksDependencies && tasksDependencies.length > 0 && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Task Dependencies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasksDependencies.map((dependency) => (
                      <div 
                        key={dependency.$id} 
                        className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-full p-2">
                            <LinkIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium truncate">
                              {dependency.dependOnTaskName || "Dependent Task"}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {dependency.dependReason || "No reason provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DottedSeparator className="my-6" />
              </>
            )}
            
            {isAssignedToCurrentUser && data.project && data.projectId && (
              <TaskCodeGenerator 
                taskName={data.name}
                taskDescription={data.description || ""}
                projectId={data.projectId}
                techStack={typeof data.project.ProjectTechStack === 'string' ? data.project.ProjectTechStack : ''}
              />
            )}
        </div>
    );
};