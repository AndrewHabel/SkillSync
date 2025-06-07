import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.skill[":skillId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.skill[":skillId"]["$delete"]>;

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.skill[":skillId"]["$delete"]({ param });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to Delete Skill");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Skill Deleted!");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to Delete Skill");
    }
  });

  return mutation;
};