"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { CreateStoryForm } from "@/features/UserStories/components/create-story-form";
export const ProjectIdStoriesClient = () =>{
  const projectId = useProjectId();
  const {data: initialValues, isLoading} = useGetProject({projectId});

  if(isLoading) return <PageLoader />;
  if(!initialValues) return <PageError message="Project not found" />
  

  return(
    <div className="w-full lg:max-w-xl">
      <CreateStoryForm onCancel={() => {}} projectOptions={[]} memberOptions={[]} />
    </div>
  )
};