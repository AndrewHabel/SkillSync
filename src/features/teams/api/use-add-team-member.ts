import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.teams[":teamId"]["members"][":memberId"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.teams[":teamId"]["members"][":memberId"]["$post"]>;

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.teams[":teamId"]["members"][":memberId"]["$post"]({ param });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to add member to team");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Member added to team!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ["teams", data.projectId] });
      }
    },
    onError: (e) => {
      console.error(e);
      toast.error("Failed to add member to team");
    }
  });

  return mutation;
};