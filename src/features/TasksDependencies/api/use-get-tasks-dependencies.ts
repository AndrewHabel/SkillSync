import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";


interface UseGetAllTaskDependenciesProps {
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
  enabled?: boolean;
}

export const useGetAllTaskDependencies = ({
  workspaceId,
  projectId,
  taskId,
  enabled = true,
}: UseGetAllTaskDependenciesProps) => {  const query = useQuery({
    queryKey: ["taskDependencies", "all", {workspaceId, projectId, taskId }],
    queryFn: async () => {

      const queryParams: Record<string, string> = {};

      if (workspaceId) queryParams.workspaceId = workspaceId;
      if (projectId) queryParams.projectId = projectId;
      if (taskId) queryParams.taskId = taskId;

      console.log(taskId);
      console.log("Fetching all task dependencies with params:", queryParams);

      const response = await client.api.TasksDependencies.$get({
        query: queryParams,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all task dependencies");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: enabled && (!!workspaceId || !!projectId || !!taskId),
  });

  return query;
};