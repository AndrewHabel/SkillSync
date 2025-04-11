import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";


type ResponseType = InferResponseType<typeof client.api.userStories[":userStoryId"]["$delete"],200>;
type RequestType = InferRequestType<typeof client.api.userStories[":userStoryId"]["$delete"]>;

export const useDeleteStory = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({param}) => {
            const response = await client.api.userStories[":userStoryId"]["$delete"]({param});
            
            if(!response.ok){
                throw new Error("Failed to delete User Story");
            }

            return await response.json();
        },
        onSuccess: ({data}) => {
            toast.success("User Story Deleted!");
            queryClient.invalidateQueries({queryKey: ["userStories"]});
            queryClient.invalidateQueries({queryKey: ["userStory", data.$id]});
        },
        onError: (e) => {
            console.log(e);
            toast.error("Failed to delete User Story");
        }
    });

    return mutation;
}
