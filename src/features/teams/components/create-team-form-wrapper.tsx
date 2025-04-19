import { Card, CardContent } from "@/components/ui/card";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateTeamForm } from "./create-team-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

interface CreateTeamFormWrapperProps {
  onCancel: () => void;
}

export const CreateTeamFormWrapper = ({ onCancel }: CreateTeamFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });

  const projectOptions = projects?.documents.map(project => ({ 
    id: project.$id, 
    name: project.name, 
    imageUrl: project.imageUrl 
  }));
  
  if (isLoadingProjects) {
    return (
      <Card className="w-full h-[500px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <CreateTeamForm 
      onCancel={onCancel} 
      projectOptions={projectOptions ?? []} 
      preSelectedProjectId={projectId ?? undefined}
    />
  );
};