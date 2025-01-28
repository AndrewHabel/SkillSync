
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"],200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"]>;

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param , json })=> {
          const response = await client.api.workspaces[":workspaceId"]["join"]["$post"]({ param , json});
          
          if(!response.ok) {
            console.log("API Response not OK:", response.status, response.statusText);
            throw new Error("Failed to Join workspace");
          }

          return await response.json();
        },
        onSuccess: ({data}) => {
          toast.success("Joined workspace!");
          queryClient.invalidateQueries({queryKey: ["workspaces"]})
          queryClient.invalidateQueries({queryKey: ["workspaces",data.$id]})

        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to Join workspace");
        }
    });

    return mutation;
};