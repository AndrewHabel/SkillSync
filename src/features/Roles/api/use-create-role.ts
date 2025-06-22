import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { createRoleSchema } from "../schemas";
import { z } from "zod";

// Define correct types for the API response
interface RoleResponse {
  data: {
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    workspaceId: string;
    roleName: string;
    manageProjects: boolean;
    manageTeams: boolean;
    manageUserStories: boolean;
    manageTasks: boolean;
    manageAnalytics: boolean;
    [key: string]: any;
  }
}

type RequestType = InferRequestType<typeof client.api.Roles.create["$post"]>;

export interface CreateRoleParams extends z.infer<typeof createRoleSchema> {}

export const useCreateRole = () => {
    
  const queryClient = useQueryClient();

  const mutation = useMutation<RoleResponse["data"], Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.Roles.create["$post"]({ json });
      
      if(!response.ok) {
        console.log("API Response not OK:", response);
        throw new Error("Failed to create role");
      }

      const result = await response.json() as RoleResponse;
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Role created successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to create role");
    }
  });

  return mutation;
};