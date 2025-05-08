import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseMemberWorkloadProps {
  workspaceId: string;
  memberId: string;
  projectId?: string;
}

export const useGetMemberWorkload = ({ workspaceId, memberId, projectId }: UseMemberWorkloadProps) => {
  const query = useQuery({
    queryKey: ["member-workload", workspaceId, memberId, projectId],
    queryFn: async () => {
      const response = await client.api.members[":memberId"].workload.$get({ 
        param: { memberId }, 
        query: { workspaceId, projectId } 
      });

      if (!response.ok){ 
        throw new Error("Failed to fetch member workload");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
}