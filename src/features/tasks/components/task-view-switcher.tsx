"use client";

import { useQueryState } from "nuqs";
import { DottedSeparator } from "@/components/dotted-separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusIcon, FileCheck2, Check, X } from "lucide-react"
import { useCreateTaskModal } from "../hooks/use-create-task-modal"
import { useTaskDependencies } from "@/features/TasksDependencies/api/use-generate-task-dependencies";
import { useCreateBulkDependencies } from "@/features/TasksDependencies/api/use-create-bulk-dependencies";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import LoadingPage from "@/app/loading";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback, useEffect, useState } from "react";

interface TaskDependency {
  dependsOnTaskId: string;
  dependsOnTaskName: string;
  reason: string;
}

interface TaskDependencyItem {
  taskId: string;
  dependsOnTaskName: string;
  dependencies: TaskDependency[];
}

import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetAllTaskDependencies } from "@/features/TasksDependencies/api/use-get-tasks-dependencies";


interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({hideProjectFilter}: TaskViewSwitcherProps) => {

  const [{status,assigneeId,dueDate,projectId},setFilters] = useTaskFilters();

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table"
  });
  const { mutate : bulkUpdate } = useBulkUpdateTasks();
  const { mutate: generateDependencies } = useTaskDependencies();
  const { mutate: saveDependencies } = useCreateBulkDependencies();
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { data: user } = useCurrent();
  const { data: members } = useGetMembers({ workspaceId });  const [isAdmin, setIsAdmin] = useState(false);
  const [isResolving, setIsResolving] = useState(false);  const [showDependenciesModal, setShowDependenciesModal] = useState(false);
  const [dependencies, setDependencies] = useState<TaskDependencyItem[]>([]);

  useEffect(() => {
    if (members && user && Array.isArray(members.documents)) {
      const currentUserMember = members.documents.find(member => 
        member.userId === user.$id
      );
      
      if (currentUserMember) {
        setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
      } else {
        setIsAdmin(false);
      }
    }
  }, [members, user]);

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({workspaceId, status, assigneeId, dueDate, projectId: paramProjectId || projectId});
  const { open } = useCreateTaskModal();
  
  const {data: tasksDependencies, isLoading: isLoadingDependencies} = useGetAllTaskDependencies({workspaceId: workspaceId, projectId: paramProjectId});

  const onKanbanChange = useCallback((tasks:{ $id: string, status: TaskStatus, position: number }[])=>{
    bulkUpdate({json: {tasks}});
  },[bulkUpdate]);
  
  const getTaskNameById = (taskId: string) => {
    if (!tasks) return "Unknown Task";
    const task = tasks.documents.find(task => task.$id === taskId);
    return task ? task.name : "Unknown Task";
  };

  const resolveDependencies = () => {

    if (!tasks || tasks.documents.length === 0) {
      toast.warning("No tasks available to resolve dependencies.");
      return;
    }

    const tasksSelectedFields = tasks.documents.map(task => ({
      id: task.$id,
      name: task.name,
      description: task.description || "",
      workspaceId: task.workspaceId,
      projectId: task.projectId
    }));

    setIsResolving(true);
    setDependencies([]);

    generateDependencies(
      { json: { tasks: tasksSelectedFields } },
      {
        onSuccess: (result) => {
          console.log("Task Dependencies Result:", result);
          if (result?.data) {
            setDependencies(result.data);
            setShowDependenciesModal(true);
            toast.success("Dependencies successfully resolved!");
          } else {
            toast.error("Failed to resolve dependencies: No data returned");
          }
        },
        onError: (error) => {
          toast.error("Failed to resolve dependencies");
          console.error("Dependencies error:", error);
        },
        onSettled: () => {
          setIsResolving(false);
        }
      }
    );
  };

  const saveDependenciesData = () => {
    const tasksDependencies = dependencies.flatMap(item => 
      item.dependencies?.map(dep => ({
        taskId: item.taskId,
        dependOnTaskId: dep.dependsOnTaskId,
        dependOnTaskName: getTaskNameById(dep.dependsOnTaskId),
        dependReason: dep.reason || "",
      })) || []
    );

    if (tasksDependencies.length === 0) {
      toast.warning("No dependencies to save");
      return;
    }

    saveDependencies(
      { json: { tasksDependencies } },
      {
        onSuccess: () => {
          setShowDependenciesModal(false);
        }
      }
    );
  };

  if( isLoadingTasks || isLoadingDependencies) {
    return <LoadingPage />;};
  
  return(
    <>
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
            {isAdmin && (
              <>
              <div className="flex items-center gap-x-2 mt-2 lg:mt-0">
                <Button onClick={open} variant="gradient" className="w-full lg:w-auto" size="sm">
                  <PlusIcon className="size-4 mr-2" />
                  New
                </Button>              
                <Button 
                  onClick={resolveDependencies} 
                  variant="gradient" 
                  className="w-full lg:w-auto" 
                  size="sm"
                  disabled={isResolving}
                >
                  <FileCheck2 className="size-4 mr-2" />
                  {isResolving ? "Resolving..." : "Resolve tasks dependencies"}
                </Button>
              </div>
              </>
            )}
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

      {/* Task Dependencies Dialog */}
      <Dialog open={showDependenciesModal} onOpenChange={setShowDependenciesModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Task Dependencies</DialogTitle>
            <DialogDescription>
              These are the dependencies between your tasks identified by the AI. Review and save them to your project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[400px] pr-4">
              {dependencies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No dependencies found</p>
              ) : (
                <div className="space-y-5">
                  {dependencies.map((item, index) => (
                    <div key={index} className="pb-4 border-b border-border">
                      <div className="font-medium mb-2">Task: {getTaskNameById(item.taskId)}</div>
                      {item.dependencies && item.dependencies.length > 0 ? (
                        <div className="pl-4 space-y-3">
                          {item.dependencies.map((dep, depIndex) => (
                            <div key={depIndex} className="bg-secondary/30 p-3 rounded-md">
                              <div className="text-sm">
                                <span className="text-primary font-medium">Depends on:</span> {getTaskNameById(dep.dependsOnTaskId)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Reason:</span> {dep.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm pl-4">No dependencies for this task</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDependenciesModal(false)}
            >
              <X className="size-4 mr-2" />
              Cancel
            </Button>            
            <Button 
              type="button" 
              onClick={() => {saveDependenciesData()}}>
              <Check className="size-4 mr-2" />
              Save Dependencies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}