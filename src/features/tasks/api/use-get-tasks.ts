import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
// Remove this if not needed: import { undefined } from "zod";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  search,
  assigneeId,
  dueDate,
}: UseGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined, // Corrected key name
          search: search ?? undefined,
          dueDate: dueDate ?? undefined, // Removed extra period at the end
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Tasks");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
