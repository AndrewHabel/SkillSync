import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";

interface TaskDependency {
  taskId: string;
  dependOnTaskId: string;
  dependReason?: string;
}

interface BulkCreateDependenciesRequest {
  json: {
    tasksDependencies: TaskDependency[];
  };
}

interface DependencyResult {
  id?: string;
  taskId: string;
  dependOnTaskId: string;
  error?: string;
}

interface BulkCreateDependenciesResponse {
  message: string;
  results: {
    success: DependencyResult[];
    failed: DependencyResult[];
  };
}

export const useCreateBulkDependencies = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<BulkCreateDependenciesResponse, Error, BulkCreateDependenciesRequest>({
    mutationFn: async ({ json }) => {
      const response = await client.api.TasksDependencies["save-dependencies"]["$post"]({ json });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to save task dependencies");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      const successCount = data.results?.success?.length || 0;
      const failedCount = data.results?.failed?.length || 0;
      
      if (failedCount > 0) {
        toast.warning(`Saved ${successCount} dependencies, ${failedCount} failed`);
      } else {
        toast.success(`Successfully saved ${successCount} dependencies!`);
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to save task dependencies");
    }
  });

  return mutation;
};
