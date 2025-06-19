"use client";

import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { PencilIcon } from "lucide-react";
import { BookUserIcon } from "lucide-react";
import { UsersIcon } from "lucide-react";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const ProjectIdClient = () => {

  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const {data:project, isLoading:isLoadingProject} = useGetProject({projectId});
  const {data:analytics, isLoading:isLoadinganalytics} = useGetProjectAnalytics({projectId});
  const { data: user } = useCurrent();
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const [isAdmin, setIsAdmin] = useState(false);
  
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
  }, [members, user]);
  const isLoading = isLoadingProject || isLoadinganalytics || isLoadingMembers;

  if(isLoading) return <PageLoader />;
  if(!project) return <PageError message="Project not found" />

  return(
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">        
        <div className="flex flex-col">          
          <div className="flex items-center gap-x-2">
            <ProjectAvatar 
              name={project.name}
              image={project.imageUrl}
              className="size-8"
            />
            <p className="text-lg font-semibold">{project.name}</p>
            {project.description && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-6 rounded-full" title="View project description">
                    <InfoIcon className="size-4 text-muted-foreground hover:text-primary" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-xl">{project.name} - Project Description</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 text-sm">
                    {project.description}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          </div>        <div className="flex gap-2">          <Button variant="secondary" size="sm" asChild>
            <Link href={`/workspaces/${project.workspaceId}/projects/${project.$id}/teams`}>
              <UsersIcon className="size-4 mr-2" />
              {isAdmin ? "Manage Teams" : "View Teams"}
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/workspaces/${project.workspaceId}/projects/${project.$id}/UserStory`}>
              <BookUserIcon className="size-4 mr-2" />
              {isAdmin ? "Manage User Stories" : "View User Stories"}
            </Link>
          </Button>
          {isAdmin && (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}>
                <PencilIcon className="size-4 mr-2" />
                Edit project
              </Link>
            </Button>
          )}
        </div>
      </div>
      {analytics ? (
          <Analytics data={analytics} />
      ):(
        null
      )}
      <TaskViewSwitcher hideProjectFilter />
    </div>
  );
};