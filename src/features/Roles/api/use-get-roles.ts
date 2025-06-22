import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { Role } from "../types";

interface UseGetRolesProps {
  workspaceId: string;
}

export const useGetRoles = ({
  workspaceId
}: UseGetRolesProps) => {  
  const query = useQuery<Role[]>({
    queryKey: ["roles", workspaceId],
    queryFn: async () => {
      const response = await client.api.Roles.$get({
        query: {
          workspaceId,
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const { data } = await response.json();
      
      // Ensure the response matches our Role type
      return data as Role[];
    },
  });

  return query;
};