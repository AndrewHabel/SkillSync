import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTeamsProps {
  workspaceId: string;
  projectId: string;
}

export const useGetTeams = ({ workspaceId, projectId }: UseGetTeamsProps) => {
  return useQuery({
    queryKey: ["teams", projectId],
    queryFn: async () => {
      const response = await client.api.teams.$get({
        query: {
          workspaceId,
          projectId
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      return response.json();
    },
    enabled: !!workspaceId && !!projectId
  });
};