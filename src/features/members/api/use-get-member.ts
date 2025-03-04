import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc"

interface UseMemberProps {
  workspaceId: string;
  memberId: string;
}

export const useGetMemberProfile = ({workspaceId , memberId}: UseMemberProps) => {
  const query = useQuery({
    queryKey: ["member", workspaceId, memberId],
    queryFn: async ()  => {
      const response = await client.api.members[":memberId"].$get({ 
        param: { memberId }, 
        query: { workspaceId } 
      });

      if (!response.ok){ 
        throw new Error("Failed to fetch members");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
}