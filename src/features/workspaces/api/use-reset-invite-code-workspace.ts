
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"],200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]>;

export const useResetInviteCode = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param })=> {
          const response = await client.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]({ param });
          
          if(!response.ok) {
            console.log("API Response not OK:", response);
            throw new Error("Failed to Reset invite code workspace");
          }

          return await response.json();
        },
        onSuccess: ({data}) => {
          toast.success("Invite Code reset!");
          queryClient.invalidateQueries({queryKey: ["workspaces"]})
          queryClient.invalidateQueries({queryKey: ["workspaces",data.$id]})

        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to Reset Invite Code");
        }
    });

    return mutation;
};