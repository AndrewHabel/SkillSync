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
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEffect, useState } from "react";

export const TaskIdClient = () => {
    const taskId = useTaskId();
    const workspaceId = useWorkspaceId();
    const { data, isLoading } = useGetTask({ taskId });
    const { data: currentUser } = useCurrent();
    const { data: members } = useGetMembers({ workspaceId });
    const [isAssignedToCurrentUser, setIsAssignedToCurrentUser] = useState(false);
    
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
            </div>
            <DottedSeparator className="my-6" />            
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