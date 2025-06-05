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
import { calculatePerformanceScore } from "@/features/members/utils/performance-score";
import { calculateWorkloadSummary } from "@/features/members/utils/workload-summary";

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
  }, [user, userId, memberId, members, tasks]);  // Define today for date comparisons
  const today = new Date();
  
  // Identify overdue tasks - tasks with due date before current date (including completed ones)
  const overdueTasks = tasks?.documents.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  }) || [];
  
  // Filter active tasks (not done and not overdue)
  const activeTasks = tasks?.documents.filter(task => {
    // Exclude completed tasks
    if (task.status === TaskStatus.DONE) return false;
    
    // Exclude overdue tasks
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (dueDate < today) return false;
    }
    
    return true;
  }) || [];
  
  // Filter completed tasks (only those that aren't overdue)
  const completedTasks = tasks?.documents.filter(task => 
    task.status === TaskStatus.DONE && (!task.dueDate || new Date(task.dueDate) >= today)
  ) || [];
  
  const [view, setView] = useQueryState("my-task-view", {
    defaultValue: "table"
  });
  
  // For kanban board updates
  const { mutate: bulkUpdate } = useBulkUpdateTasks();
  const onKanbanChange = useCallback((tasks: { $id: string, status: TaskStatus, position: number }[]) => {
    bulkUpdate({ json: { tasks } });
  }, [bulkUpdate]);
    if (!userId) return <PageError message="User profile not found" />;
  
  const {
    performanceScore,
    completionScore,
    activeTasksScore,
    onTimeScore,
    completedTasksCount,
    activeTasksCount,
    overdueTasksCount,
    totalTasksCount
  } = calculatePerformanceScore(tasks?.documents);

  const {
    totalEstimatedHours,
    workloadByStatus,
    statusCounts
  } = calculateWorkloadSummary(tasks?.documents);

  return (
    <div className="h-full flex flex-col space-y-4">
      <DottedSeparator />
      
      {/* Task status summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
        </Card>        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Done</p>
            <p className="text-3xl font-bold">{statusCounts.done}</p>
            <Badge variant={TaskStatus.DONE} className="mt-2">Done</Badge>
          </CardContent>
        </Card>
        <Card className="p-1 flex flex-col items-center justify-center">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-3xl font-bold">
              {statusCounts.overdue}
            </p>
            <div className="flex flex-col items-center gap-2 mt-2">
              <Badge variant="destructive" className="px-3 py-1">Overdue</Badge>
              {overdueTasks.filter(task => task.status === TaskStatus.DONE).length > 0 && (
                <div className="flex items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 dark:bg-red-900/20 px-3 py-1 text-xs text-red-500 dark:text-red-400">
                  <span className="mr-1 font-medium">{overdueTasks.filter(task => task.status === TaskStatus.DONE).length}</span> completed
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="p-1 flex flex-col items-center justify-center">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Performance</p>
            <p className="text-3xl font-bold">{performanceScore}</p>
            <div className="mt-2">
              {performanceScore >= 90 ? (
                <Badge className="bg-green-600 hover:bg-green-700 text-white">Excellent</Badge>
              ) : performanceScore >= 75 ? (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Good</Badge>
              ) : performanceScore >= 60 ? (
                <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">Average</Badge>
              ) : (
                <Badge className="bg-orange-600 hover:bg-orange-700 text-white">Needs Improvement</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>        <Card style={{ backgroundColor: 'hsl(var(--table-background))' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance Score Breakdown</CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Score: </div>
            <div className="text-2xl font-bold">{performanceScore}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">              <div className="flex justify-between">
                <span className="text-sm font-medium">Task Completion (50%)</span>
                <span className="text-sm font-medium">
                  {Math.round(completionScore * 10) / 10}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedTasksCount} of {totalTasksCount} tasks completed
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Active Tasks (30%)</span>
                <span className="text-sm font-medium">
                  {Math.round(activeTasksScore * 10) / 10}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${totalTasksCount > 0 ? (activeTasksCount / totalTasksCount) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {activeTasksCount} of {totalTasksCount} tasks in progress
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Avoiding Overdue (20%)</span>
                <span className="text-sm font-medium">
                  {Math.round(onTimeScore * 10) / 10}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${totalTasksCount > 0 ? ((totalTasksCount - overdueTasksCount) / totalTasksCount) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {totalTasksCount - overdueTasksCount} of {totalTasksCount} tasks on time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

        <Card style={{ backgroundColor: 'hsl(var(--table-background))' }}>
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
            
            {workloadByStatus.overdue > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  Overdue
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold text-red-500">{workloadByStatus.overdue}</p>
                  <p className="text-xs text-muted-foreground">hours</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${totalEstimatedHours ? (workloadByStatus.overdue / totalEstimatedHours) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>      {/* Active Tasks Section */}
      <Card className="flex-1" style={{ backgroundColor: 'hsl(var(--table-background))' }}>
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle>Active Tasks</CardTitle>
          <Badge variant={TaskStatus.TODO} className="px-3 py-1">
              {activeTasks.length} {activeTasks.length === 1 ? 'Task' : 'Tasks'}
            </Badge>
        </CardHeader>
        <CardContent className="pt-2">
          <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full project-table-bg">
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
              <div className="tasks-table rounded-md">
                <DataTable columns={columns} data={activeTasks} />
              </div>
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban onChange={onKanbanChange} data={activeTasks} />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-[600px]">
              <DataCalendar data={activeTasks} />
            </TabsContent>
          </Tabs>
        </CardContent>      </Card>      {/* Overdue Tasks Section */}
      {overdueTasks.length > 0 && (
        <Card style={{ backgroundColor: 'hsl(var(--table-background))' }}>
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-x-2">
              Overdue Tasks
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="px-3 py-1">
                {overdueTasks.length} {overdueTasks.length === 1 ? 'Task' : 'Tasks'}
              </Badge>
              {overdueTasks.filter(task => task.status === TaskStatus.DONE).length > 0 && (
                <div className="flex items-center justify-center rounded-md border border-red-400/30 bg-red-400/10 dark:bg-red-900/20 px-2 py-1 text-xs text-red-500 dark:text-red-400">
                  <span className="mr-1 font-medium">{overdueTasks.filter(task => task.status === TaskStatus.DONE).length}</span> completed
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Tabs defaultValue="table" className="flex-1 w-full project-table-bg">
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
              </TabsList>
              
              <TabsContent value="table" className="mt-0">
                <div className="tasks-table rounded-md">
                  <DataTable columns={columns} data={overdueTasks} />
                </div>
              </TabsContent>
              <TabsContent value="kanban" className="mt-0">
                <DataKanban onChange={onKanbanChange} data={overdueTasks} />
              </TabsContent>
              
              {overdueTasks.some(task => task.status === TaskStatus.DONE) && (
                <div className="mt-3 p-2 border border-amber-200 rounded bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
                  <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Completed overdue tasks are included in the count but contribute 0 hours to workload.
                  </p>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}      {completedTasks.length > 0 && (
        <Card style={{ backgroundColor: 'hsl(var(--table-background))' }}>
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle>Completed Tasks</CardTitle>
            <Badge variant={TaskStatus.DONE} className="px-3 py-1">
              {completedTasks.length} {completedTasks.length === 1 ? 'Task' : 'Tasks'}
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="project-table-bg p-4">
              <div className="tasks-table">
                <DataTable 
                  columns={columns} 
                  data={completedTasks} 
                />
              </div>
            </div>          </CardContent>
        </Card>
      )}
    </div>
  );
};