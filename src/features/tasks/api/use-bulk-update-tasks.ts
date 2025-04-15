import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";
import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.tasks["bulk-update"]["$post"],200>;
type RequestType = InferRequestType<typeof client.api.tasks["bulk-update"]["$post"]>;

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json})=> {
          const response = await client.api.tasks["bulk-update"]["$post"]({ json });
          
          if(!response.ok) {
            //console.log(json.projectId);
            console.log("API Response not OK:", response);
            throw new Error("Failed to update Task");
          }

          return await response.json();
        },
        onSuccess: ({ data }) => {
          toast.success("Tasks Updated!");
          queryClient.invalidateQueries({queryKey: ["tasks"]});
          
          // Invalidate workspace analytics for all affected workspaces
          if (data && Array.isArray(data)) {
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
          toast.error("Failed to update Tasks");
        }
    });

    return mutation;
};