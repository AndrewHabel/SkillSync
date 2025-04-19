import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.codegeneration["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.codegeneration["$post"]>;

export const useCodeGeneration = () =>{
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.codegeneration["$post"]({ json });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to generate code");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Code generated successfully!");
      return data;
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to generate Code!");
    }
  });

  return mutation;
};