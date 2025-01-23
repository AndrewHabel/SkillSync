import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { promise } from "zod";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>;

export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json })=> {
          try{
            const response = await client.api.auth.register["$post"]({ json });
            return await response.json();
          }catch(e){
            console.log(e)
            return Promise.reject(e);
          }
        },
        onSuccess: () => {
          router.refresh();
          queryClient.invalidateQueries({queryKey: ["current"]})
        }
    });

    return mutation;
};