import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.TasksDependencies["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.TasksDependencies["$post"]>;

export const useTaskDependencies = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.TasksDependencies["$post"]({ json });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to get tasks Dependencies");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Task Dependencies Response:", data);
      toast.success("Tasks Dependencies generated successfully!");
      return data;
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to get tasks Dependencies");
    }
  });

  return mutation;
};