import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.taskgeneration["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.taskgeneration["$post"]>;

export const useTaskGeneration = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.taskgeneration["$post"]({ json });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to generate tasks");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Tasks generated successfully!");
      return data;
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to generate tasks");
    }
  });

  return mutation;
};