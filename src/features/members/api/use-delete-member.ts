
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$delete"],200>;
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$delete"]>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ param })=> {
          const response = await client.api.members[":memberId"]["$delete"]({ param });
          
          if(!response.ok) {
            console.log("API Response not OK:", response);
            throw new Error("Failed to Delete Member");
          }

          return await response.json();
        },
        onSuccess: () => {
          toast.success("Member Deleted!");
          queryClient.invalidateQueries({queryKey: ["member"]})
          //queryClient.invalidateQueries({queryKey: ["member",data.$id]})

        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to Delete Member");
        }
    });

    return mutation;
};