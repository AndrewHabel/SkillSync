import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc"; 

interface UseGetStoryProps {
  storyId: string;
}

export const useGetStory = ({
  storyId
}: UseGetStoryProps) => {
  const query = useQuery({
    queryKey: ["story", storyId],
    queryFn: async () => {
      const response = await client.api.userStories[":userStoryId"].$get({ param: {
        userStoryId: storyId,
      }});

      if (!response.ok) {
        throw new Error("Failed to fetch Story");
      }

      const { data } = await response.json();

      return data;

    },
  });

  return query;
};
