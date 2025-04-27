import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.skill["bulk-create"]["$post"],200>;
type RequestType = InferRequestType<typeof client.api.skill["bulk-create"]["$post"]>;

export const useBulkCreateSkills = () => {
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json })=> {
          const response = await client.api.skill["bulk-create"]["$post"]({ json });
          
          if(!response.ok) {
            console.log("API Response not OK:", response);
            throw new Error("Failed to create skills in bulk");
          }

          return await response.json();
        },
        onSuccess: ({data}) => {
          toast.success("Skills added to profile!");
        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to add skills to profile");
        }
    });

    return mutation;
};