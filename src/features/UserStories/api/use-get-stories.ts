import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc"; 

interface UseGetStoriesProps {
    workspaceId: string;
    projectId: string;
} 

export const useGetStories = ({
    workspaceId,
    projectId,
}: UseGetStoriesProps) => {
    const query = useQuery({
        queryKey: ["userStories", workspaceId, projectId],
        queryFn: async () => {
            const response = await client.api.userStories.$get({
                query: {
                    workspaceId,
                    projectId,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch User Stories");
            }

            const { data } = await response.json();

            return data;
        }
    });

    return query;
}


