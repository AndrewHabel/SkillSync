import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType , InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.userStories["$post"],200>;
type RequestType = InferRequestType<typeof client.api.userStories["$post"]>;

export const useCreateStory = () => {
    const queryClient = useQueryClient();
    
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json })=> {
            const response = await client.api.userStories["$post"]({ json });
            
            if(!response.ok) {
                console.log(json.projectId);
                console.log("API Response not OK:", response);
                throw new Error("Failed to create User Story");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("User Story Created!");
            queryClient.invalidateQueries({queryKey: ["userStories"]})
        },
        onError: (e) => {
            console.log(e);
            toast.error("Failed to create User Story");
        } 
    });

    return mutation;
}






