import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["invite"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["invite"]["$post"]>;

export const useInviteEmail = (workspaceId: string) => {
  const mutation = useMutation<ResponseType, Error, { email: string; name: string }>({
    mutationFn: async ({ email, name }) => {
      const response = await client.api.workspaces[":workspaceId"]["invite"]["$post"]({
        param: { workspaceId },
        json: { email, name }
      });
      
      if (!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to send invitation email");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to send invitation email");
    }
  });

  return mutation;
};