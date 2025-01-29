
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.projects["$post"],200>;
type RequestType = InferRequestType<typeof client.api.projects["$post"]>;

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ form })=> {
          const response = await client.api.projects["$post"]({ form });
          
          if(!response.ok) {
            console.log("API Response not OK:", response);
            throw new Error("Failed to create Projects");
          }

          return await response.json();
        },
        onSuccess: () => {
          toast.success("Projects Created!");
          queryClient.invalidateQueries({queryKey: ["projects"]})
        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to create Projects");
        }
    });

    return mutation;
};