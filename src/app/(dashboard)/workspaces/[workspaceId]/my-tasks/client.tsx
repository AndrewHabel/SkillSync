"use client";

import { PageError } from "@/components/page-error";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/features/tasks/components/data-table";
import { columns } from "@/features/tasks/components/columns";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCurrent } from "@/features/auth/api/use-current";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryState } from "nuqs";
import { DataKanban } from "@/features/tasks/components/data-kanban";
import { useCallback, useEffect, useState } from "react";
import { TaskStatus } from "@/features/tasks/types";
import { useBulkUpdateTasks } from "@/features/tasks/api/use-bulk-update-tasks";
import { DataCalendar } from "@/features/tasks/components/data-calendar";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Badge } from "@/components/ui/badge";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetMemberWorkload } from "@/features/members/api/use-get-member-workload";

export const MyTasksClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();
  const { open } = useCreateTaskModal();
  const { data: members } = useGetMembers({ workspaceId });
  const userId = user?.$id;
  

  const [memberId, setMemberId] = useState<string | null>(null);
  
  useEffect(() => {
    if (user && members && members.documents) {
      const currentMember = members.documents.find(member => member.userId === userId);
      if (currentMember) {
        setMemberId(currentMember.$id);
      }
    }
  }, [user, members, userId]);
  
  const { data: tasks, isLoading } = useGetTasks({
    workspaceId,
    assigneeId: memberId || userId,
  });
  

  useEffect(() => {
    if (user && members) {
      console.log("User ID:", userId);
      console.log("Member ID:", memberId);
      console.log("Members:", members.documents);
    }
    if (tasks) {
      console.log("Tasks:", tasks.documents);
    }
  }, [user, userId, memberId, members, tasks]);
  

  const activeTasks = tasks?.documents.filter(task => task.status !== TaskStatus.DONE) || [];
  const completedTasks = tasks?.documents.filter(task => task.status === TaskStatus.DONE) || [];
  
  const [view, setView] = useQueryState("my-task-view", {
    defaultValue: "table"
  });
  
  // For kanban board updates
  const { mutate: bulkUpdate } = useBulkUpdateTasks();
  const onKanbanChange = useCallback((tasks: { $id: string, status: TaskStatus, position: number }[]) => {
    bulkUpdate({ json: { tasks } });
  }, [bulkUpdate]);
  
  if (!userId) return <PageError message="User profile not found" />;
  
  // Count tasks by status
  const statusCounts = {
    todo: tasks?.documents.filter(task => task.status === TaskStatus.TODO).length || 0,
    inProgress: tasks?.documents.filter(task => task.status === TaskStatus.IN_PROGRESS).length || 0,
    inReview: tasks?.documents.filter(task => task.status === TaskStatus.IN_REVIEW).length || 0,
    done: tasks?.documents.filter(task => task.status === TaskStatus.DONE).length || 0,
    backlog: tasks?.documents.filter(task => task.status === TaskStatus.BACKLOG).length || 0,
  };

  // Calculate total workload in hours
  const totalEstimatedHours = tasks?.documents.reduce((total, task) => {
    return total + (task.estimatedHours || 0);
  }, 0) || 0;

  // Calculate workload by status
  const workloadByStatus = {
    todo: tasks?.documents.filter(task => task.status === TaskStatus.TODO)
      .reduce((total, task) => total + (task.estimatedHours || 0), 0) || 0,
    inProgress: tasks?.documents.filter(task => task.status === TaskStatus.IN_PROGRESS)
      .reduce((total, task) => total + (task.estimatedHours || 0), 0) || 0,
    inReview: tasks?.documents.filter(task => task.status === TaskStatus.IN_REVIEW)
      .reduce((total, task) => total + (task.estimatedHours || 0), 0) || 0,
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <DottedSeparator />
      
      {/* Task status summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">To Do</p>
            <p className="text-3xl font-bold">{statusCounts.todo}</p>
            <Badge variant={TaskStatus.TODO} className="mt-2">To Do</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-3xl font-bold">{statusCounts.inProgress}</p>
            <Badge variant={TaskStatus.IN_PROGRESS} className="mt-2">In Progress</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">In Review</p>
            <p className="text-3xl font-bold">{statusCounts.inReview}</p>
            <Badge variant={TaskStatus.IN_REVIEW} className="mt-2">In Review</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Done</p>
            <p className="text-3xl font-bold">{statusCounts.done}</p>
            <Badge variant={TaskStatus.DONE} className="mt-2">Done</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Backlog</p>
            <p className="text-3xl font-bold">{statusCounts.backlog}</p>
            <Badge variant={TaskStatus.BACKLOG} className="mt-2">Backlog</Badge>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Workload Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Total Estimated Hours</h3>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold">{totalEstimatedHours}</p>
                <p className="text-muted-foreground mb-1">hours</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                To Do
              </h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{workloadByStatus.todo}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${totalEstimatedHours ? (workloadByStatus.todo / totalEstimatedHours) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                In Progress
              </h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{workloadByStatus.inProgress}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${totalEstimatedHours ? (workloadByStatus.inProgress / totalEstimatedHours) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                In Review
              </h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold">{workloadByStatus.inReview}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${totalEstimatedHours ? (workloadByStatus.inReview / totalEstimatedHours) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Active Tasks Section */}
      <Card className="flex-1">
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle>Active Tasks</CardTitle>
          <Badge variant={TaskStatus.TODO} className="px-3 py-1">
              {activeTasks.length} {activeTasks.length === 1 ? 'Task' : 'Tasks'}
            </Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs defaultValue={view} onValueChange={setView}>
            <TabsList className="bg-secondary p-1 mb-4">
              <TabsTrigger 
                className="h-8 data-[state=inactive]:bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
                value="table">
                Table
              </TabsTrigger>
              <TabsTrigger 
                className="h-8 data-[state=inactive]:bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
                value="kanban">
                Kanban
              </TabsTrigger>
              <TabsTrigger 
                className="h-8 data-[state=inactive]:bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" 
                value="calendar">
                Calendar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={activeTasks} />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban onChange={onKanbanChange} data={activeTasks} />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-[600px]">
              <DataCalendar data={activeTasks} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle>Completed Tasks</CardTitle>
            <Badge variant={TaskStatus.DONE} className="px-3 py-1">
              {completedTasks.length} {completedTasks.length === 1 ? 'Task' : 'Tasks'}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <DataTable 
              columns={columns} 
              data={completedTasks} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};