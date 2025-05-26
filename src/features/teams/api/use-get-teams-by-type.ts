import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTeamsByTypeProps {
  workspaceId: string;
  projectId: string;
  teamtype?: string;
}

export const useGetTeamsByType = ({ workspaceId, projectId, teamtype }: UseGetTeamsByTypeProps) => {
  return useQuery({
    queryKey: ["teams", projectId, teamtype],
    queryFn: async () => {
      const response = await client.api.teams.$get({
        query: {
          workspaceId,
          projectId,
          teamtype
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      return response.json();
    },
    enabled: !!workspaceId && !!projectId && !!teamtype
  });
};
