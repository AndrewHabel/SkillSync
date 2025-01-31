
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.tasks["$post"],200>;
type RequestType = InferRequestType<typeof client.api.tasks["$post"]>;

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json })=> {
          const response = await client.api.tasks["$post"]({ json });
          
          if(!response.ok) {
            console.log(json.projectId);
            console.log("API Response not OK:", response);
            throw new Error("Failed to create Task");
          }

          return await response.json();
        },
        onSuccess: () => {
          toast.success("Task Created!");
          queryClient.invalidateQueries({queryKey: ["tasks"]})
        },
        onError: (e) => {
          console.log(e);
          toast.error("Failed to create Task");
        }
    });

    return mutation;
};