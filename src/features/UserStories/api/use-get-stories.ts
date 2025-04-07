import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc"; 

interface UseGetStoriesProps {
    workspaceId: string;
    projectId: string;
    description: string;
    acceptanceCriteria?: string | null;
} 

export const useGetStories = ({
    workspaceId,
    projectId,
    description,
    acceptanceCriteria,
}: UseGetStoriesProps) => {
    const query = useQuery({
        queryKey: ["userStories", workspaceId, projectId, description, acceptanceCriteria],
        queryFn: async () => {
            const response = await client.api.userStories.$get({
                query: {
                    workspaceId,
                    projectId,
                    description,
                    acceptanceCriteria,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch User Stories");
            }

            const { documents } = await response.json();

            return documents;
        }
    });

    return query;
}


