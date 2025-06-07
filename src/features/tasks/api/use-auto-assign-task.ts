import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define our own types since we're accessing a nested route
interface AutoAssignRequest {
  taskId: string;
}

interface AutoAssignResponse {
  $id: string;
  assigneeId: string;
  assignee?: {
    $id: string;
    name: string;
    email: string;
  };
  aiReasoning?: string;
  [key: string]: any;
}

export const useAutoAssignTask = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation<{ data: AutoAssignResponse }, Error, { json: AutoAssignRequest }>({
    mutationFn: async ({ json }) => {
      try {
        // Make a regular fetch call to our API endpoint        // Make a direct fetch call to our API endpoint
        // The route is registered as /api/tasks/auto-assign
        const response = await fetch('/api/tasks/auto-assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(json),
          credentials: 'include' // Include cookies for authentication
        });
          if (!response.ok) {
          console.error("API Response not OK:", response);
          
          // Try to get error details from response
          const errorData = await response.json().catch(() => ({}));
          
          if (errorData.error) {
            throw new Error(errorData.error);
          } else if (response.status === 404) {
            throw new Error("Resource not found. Check if all required collections exist.");
          } else {
            throw new Error(`Failed to auto-assign task: ${response.status} ${response.statusText}`);
          }
        }

        return await response.json();
      } catch (error) {
        console.error("Auto-assign error:", error);
        throw error;
      }
    },    onSuccess: ({ data }) => {
      // Dismiss any loading toasts
      toast.dismiss();
      
      // Check if a member was actually assigned
      const wasAssigned = !!data.assigneeId && !!data.assignee;
      
      if (wasAssigned) {
        // Show success message with assignee info
        const assigneeName = data.assignee?.name || "team member";
        toast.success(`Task assigned successfully to ${assigneeName}!`);
        
        // Invalidate task queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
      } else {
        // No assignment happened, but we have AI reasoning to show
        // Note: The reasoning dialog will be shown by the component
        // No need to invalidate queries since the task wasn't changed
      }
    },onError: (e) => {
      console.error(e);
      // Dismiss any loading toasts
      toast.dismiss();
      
      // Show a more specific error message if available
      if (e instanceof Error && e.message) {
        const errorMessage = e.message;
        const errorDetails = (e as any).details;
        
        // Special handling for team-related errors
        if (errorMessage.includes("No") && errorMessage.includes("exists in this project")) {
          const teamType = errorMessage.match(/"([^"]+)"/)?.[1] || "required team";
          toast.error(errorMessage, {
            description: "Create the required team before using auto-assign",
            action: {
              label: "Teams",
              onClick: () => {
                // Get the current URL parts to navigate to teams page
                const urlParts = window.location.pathname.split('/');
                const workspaceIndex = urlParts.findIndex(part => part === 'workspaces');
                const projectIndex = urlParts.findIndex(part => part === 'projects');
                
                if (workspaceIndex >= 0 && projectIndex >= 0 && urlParts.length > projectIndex + 1) {
                  const workspaceId = urlParts[workspaceIndex + 1];
                  const projectId = urlParts[projectIndex + 1];
                  window.location.href = `/workspaces/${workspaceId}/projects/${projectId}/teams`;
                }
              }
            }
          });
        } else if (errorMessage.includes("has no members")) {
          toast.error(errorMessage, {
            description: "Add team members to the team before using auto-assign"
          });
        } else if (errorMessage.includes("No matching team type found")) {
          toast.error("No matching team for this role", {
            description: "The task's role doesn't correspond to an existing team type"
          });
        } else if (errorMessage.includes("No valid team members found")) {
          toast.error(errorMessage, {
            description: errorDetails || "Make sure team members exist and are properly configured"
          });
        } else if (errorMessage.includes("Task must have a preferred role")) {
          toast.error(errorMessage, {
            description: "Edit the task to add a preferred role first"
          });
        } else if (errorMessage.includes("Task must belong to a project")) {
          toast.error(errorMessage, {
            description: "Only tasks assigned to a project can use auto-assign"
          });
        } else {
          // Generic error handling
          toast.error(`Auto-assignment failed: ${errorMessage}`, {
            description: errorDetails || "Please try again or contact support if the issue persists"
          });
        }
      } else {
        toast.error("Failed to auto-assign task", {
          description: "Please try again later or contact support if the issue persists"
        });
      }
    }
  });

  return mutation;
};
