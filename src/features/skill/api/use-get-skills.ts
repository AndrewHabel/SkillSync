import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { Skill } from "../types";

interface UseGetSkillsProps {
  workspaceId: string;
  userId?: string;
}

export const useGetSkills = ({
  workspaceId,
  userId,
}: UseGetSkillsProps) => {
  const query = useQuery({
    queryKey: ["skills", workspaceId, userId],
    queryFn: async () => {
      const response = await client.api.skill.$get({
        query: {
          workspaceId,
          userId: userId ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Skills");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};