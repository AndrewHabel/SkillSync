import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.teams[":teamId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.teams[":teamId"]["$delete"]>;

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.teams[":teamId"]["$delete"]({ param });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to delete team");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Team deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      
      // Invalidate specific team data
      queryClient.invalidateQueries({ queryKey: ["team", data.$id] });
    
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete team");
    }
  });

  return mutation;
};