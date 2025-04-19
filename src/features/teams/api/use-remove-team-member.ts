import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

interface UseRemoveTeamMemberProps {
  param: {
    teamId: string;
    memberId: string;
  };
}

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ param }: UseRemoveTeamMemberProps) => {
      const response = await client.api.teams[":teamId"].members[":memberId"].$delete({
        param: {
          teamId: param.teamId,
          memberId: param.memberId
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove team member");
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success("Member removed from team");
      
      // Invalidate specific team data
      queryClient.invalidateQueries({ queryKey: ["team", variables.param.teamId] });
      
      // Invalidate teams list
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to remove team member");
    }
  });
};