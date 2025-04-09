"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { ViewStories } from "@/features/UserStories/components/view-stories";

export const ProjectIdStoriesClient = () =>{

  const projectId = useProjectId();

  const {data: initialValues, isLoading} = useGetProject({projectId});

  if(isLoading) return <PageLoader />;
  if(!initialValues) return <PageError message="Project not found" /> 
  return(
    <ViewStories />
  )
};