import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { createTeamSchema } from "../schemas";

// Use the schema to derive types
type TeamData = z.infer<typeof createTeamSchema>;

// Define request and response types
type ResponseType = any; // Temporary type until API is fully implemented
type RequestType = { 
  json: TeamData
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      // API endpoint for team creation
      const response = await client.api.teams["$post"]({ json });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to create team");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Team Created!");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      
      // Invalidate project-specific teams
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ["teams", data.projectId] });
      }
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to create team");
    }
  });

  return mutation;
};