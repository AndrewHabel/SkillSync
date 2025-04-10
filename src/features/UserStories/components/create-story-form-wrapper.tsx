import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateStoryForm } from "./create-story-form";

interface CreateStoryFormWrapperProps {
    onCancel: () => void;
}

export const CreateStoryFormWrapper = ({onCancel}: CreateStoryFormWrapperProps) => {
    
    return (
        <CreateStoryForm onCancel={onCancel}/>
    )
}