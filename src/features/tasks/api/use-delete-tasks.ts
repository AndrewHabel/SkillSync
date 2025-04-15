
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";



type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"],200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param })=> {
          const response = await client.api.tasks[":taskId"]["$delete"]({ param });
          
          if(!response.ok) {
            console.log("API Response not OK:", response);
            throw new Error("Failed to delete Task");
          }

          return await response.json();
        },
        onSuccess: ({data}) => {
          toast.success("Task Deleted!");
          queryClient.invalidateQueries({queryKey: ["tasks"]})
          queryClient.invalidateQueries({queryKey: ["task",data.$id]})
        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to delete Task");
        }
    });

    return mutation;
};