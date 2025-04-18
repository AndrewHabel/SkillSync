"use client";

import { useQueryState } from "nuqs";
import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon } from "lucide-react"
import { useCreateTaskModal } from "../hooks/use-create-task-modal"

import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import LoadingPage from "@/app/loading";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";


interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({hideProjectFilter}: TaskViewSwitcherProps) => {

  const [{status,assigneeId,dueDate,projectId},setFilters] = useTaskFilters();

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table"
  });

  const { mutate : bulkUpdate } = useBulkUpdateTasks();

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({workspaceId, status, assigneeId, dueDate, projectId: paramProjectId || projectId});
  const { open } = useCreateTaskModal();

  const onKanbanChange = useCallback((tasks:{ $id: string, status: TaskStatus, position: number }[])=>{
    bulkUpdate({json: {tasks}});
  },[bulkUpdate]);

  return(
    <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full border rounded-lg project-table-bg">
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center ">
          <TabsList className="w-full lg:w-auto bg-secondary p-1">
            <TabsTrigger 
              className="h-8 w-full lg:w-auto data-[state=inactive]:bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
              value="table">
              Table
            </TabsTrigger>
            <TabsTrigger 
              className="h-8 w-full lg:w-auto data-[state=inactive]:bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
              value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger 
              className="h-8 w-full lg:w-auto data-[state=inactive]:bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
              value="calendar">
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button onClick={open} variant="gradient" className="w-full lg:w-auto" size="sm">
            <PlusIcon className="size-4 mr-2" />
            New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />
        {isLoadingTasks ? (
          <LoadingPage />
        ): (
          <>
          <TabsContent value="table" className="mt-0">
            <DataTable columns={columns} data={tasks?.documents ?? []} />
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
            <DataKanban onChange={onKanbanChange} data={tasks?.documents ?? []} />
          </TabsContent>
          <TabsContent value="calendar" className="mt-0 h-full pb-4">
            <DataCalendar data={tasks?.documents ?? []}  />
          </TabsContent>
        </>
        )}
        
      </div>
    </Tabs>
  )
}