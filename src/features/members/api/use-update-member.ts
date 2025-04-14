
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.members[":memberId"]["$patch"],200>;
type RequestType = InferRequestType<typeof client.api.members[":memberId"]["$patch"]>;

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ form ,param })=> {
          console.log("wegwegegwegdsgb")

          const response = await client.api.members[":memberId"]["$patch"]({ form , param});
          
          if(!response.ok) {
            console.log("API Response not OK:", response);
            throw new Error("Failed to update Member");
          }

          return await response.json();
        },
        onSuccess: () => {
          toast.success("Member update!");
          queryClient.invalidateQueries({queryKey: ["member"]})
          //queryClient.invalidateQueries({queryKey: ["member",data.$id]})
        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to update Member");
        }
    });

    return mutation;
};