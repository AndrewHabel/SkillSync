"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { StarryBackground } from "@/components/starry-background";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspaces-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";


export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const {data: initialValues, isLoading} = useGetWorkspace({workspaceId})

  if(isLoading) return <PageLoader />;
  if(!initialValues) return <PageError message="Project not found" />
    

  return(
    <div className="w-full lg:max-2-xl relative">
      <StarryBackground starCount={150} minSize={0.4} maxSize={2.2} />
      <EditWorkspaceForm initialValues={initialValues}/>
    </div>
  );
};