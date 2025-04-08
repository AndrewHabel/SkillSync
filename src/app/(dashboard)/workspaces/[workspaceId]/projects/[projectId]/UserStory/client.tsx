"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetStories } from "@/features/UserStories/api/use-get-stories";
import { CreateStoryForm } from "@/features/UserStories/components/create-story-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const ProjectIdStoriesClient = () =>{

  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const {data: initialValues, isLoading} = useGetProject({projectId});

  const {data:userSotries , isLoading:lodingStories} = useGetStories({projectId, workspaceId});

  if(isLoading) return <PageLoader />;
  if(!initialValues) return <PageError message="Project not found" />
  console.log("userSotries", userSotries)
  
  return(
    <div className="w-full lg:max-w-xl">
      {userSotries?.documents.map((userStory) => (
        <div key={userStory.$id} className="border-b py-4 last:border-b-0">
          <p className="text-lg font-medium">{userStory.description}</p>
          <p className="text-lg font-medium">{userStory.AcceptanceCriteria}</p>
        </div>
      ))}
    </div>
  )
};