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
      
      // Show success message with assignee info if available
      const assigneeName = data.assignee?.name || "team member";
      toast.success(`Task assigned successfully to ${assigneeName}!`);
      
      // Note: The reasoning is now shown in a dialog popup in the UI
      // instead of as a toast notification
      
      // Invalidate task queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", data.$id] });
    },onError: (e) => {
      console.error(e);
      // Dismiss any loading toasts
      toast.dismiss();
      
      // Show a more specific error message if available
      if (e instanceof Error && e.message) {
        toast.error(`Auto-assignment failed: ${e.message}`);
      } else {
        toast.error("Failed to auto-assign task. Please try again later.");
      }
    }
  });

  return mutation;
};
