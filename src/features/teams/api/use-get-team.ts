import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTeamProps {
  teamId: string;
}

export const useGetTeam = ({ teamId }: UseGetTeamProps) => {
  const query = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const response = await client.api.teams[":teamId"].$get({param:{teamId}});

      if (!response.ok) {
        throw new Error("Failed to fetch team");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: !!teamId
  });

  return query;
};