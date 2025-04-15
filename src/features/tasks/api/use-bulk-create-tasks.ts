import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.tasks["bulk-create"]["$post"],200>;
type RequestType = InferRequestType<typeof client.api.tasks["bulk-create"]["$post"]>;

export const useBulkCreateTasks = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json })=> {
          const response = await client.api.tasks["bulk-create"]["$post"]({ json });
          
          if(!response.ok) {
            console.log("API Response not OK:", response);
            throw new Error("Failed to create tasks in bulk");
          }

          return await response.json();
        },
        onSuccess: ({data}) => {
          toast.success("Tasks added to project!");
          // Invalidate task queries
          queryClient.invalidateQueries({queryKey: ["tasks"]});
          
          // Invalidate workspace analytics
          if (data && Array.isArray(data) && data.length > 0) {
            const workspaceIds = new Set(data.map(task => task.workspaceId).filter(Boolean));
            const projectIds = new Set(data.map(task => task.projectId).filter(Boolean));
            
            // Invalidate analytics for each affected workspace
            workspaceIds.forEach(workspaceId => {
              if (workspaceId) {
                queryClient.invalidateQueries({queryKey: ["project-analytics", workspaceId]});
              }
            });
            
            // Invalidate analytics for each affected project
            projectIds.forEach(projectId => {
              if (projectId) {
                queryClient.invalidateQueries({queryKey: ["project-analytics", projectId]});
              }
            });
          }
        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to add tasks to project");
        }
    });

    return mutation;
};