import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { DatePicker } from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataFiltersProps{
  hideProjectFilter?: boolean;
};

export const DataFilters = ({hideProjectFilter}: DataFiltersProps) => {
  const workspaceId = useWorkspaceId();
  
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({workspaceId});
  const { data: members, isLoading: isLoadingMembers} = useGetMembers({workspaceId});

  const isLoading = isLoadingProjects || isLoadingMembers;

  const projectOptions = projects?.documents.map((project) => ({
    value: project.$id,
    label: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  if(isLoading) return null;

  return(
    <div className="flex flex-col lg:flex-row gap-2">

    </div>
  )
};