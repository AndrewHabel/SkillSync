"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { DottedSeparator } from "@/components/dotted-separator";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";
import { TaskStatus } from "@/features/tasks/types";
import { AnalyticsCard } from "@/components/analytics-card";
import { CalendarIcon, CheckCheckIcon, ClockIcon, UsersIcon } from "lucide-react";

export const AdminAnalyticsClient = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  const { data: user } = useCurrent();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });

  const isLoading = isLoadingAnalytics || isLoadingMembers || isLoadingTasks || isLoadingProjects || isAdmin === null || !user;

  // Check if the current user is an admin
  useEffect(() => {
    if (members && user && Array.isArray(members.documents)) {
      // Find the current user's member document
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

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      router.push(`/workspaces/${workspaceId}`);
    }
  }, [isAdmin, router, workspaceId]);

  if (isLoading) return <PageLoader />;
  if (!analytics || !tasks || !projects || !members || !user) 
    return <PageError message="Failed to load analytics data" />;
  if (isAdmin === false)
    return <PageError message="Unauthorized: Admin access required" />;

  // Prepare data for Task Status Distribution (Pie Chart)
  const taskStatusData = [
    { name: 'Backlog', value: tasks.documents.filter(task => task.status === TaskStatus.BACKLOG).length },
    { name: 'To Do', value: tasks.documents.filter(task => task.status === TaskStatus.TODO).length },
    { name: 'In Progress', value: tasks.documents.filter(task => task.status === TaskStatus.IN_PROGRESS).length },
    { name: 'In Review', value: tasks.documents.filter(task => task.status === TaskStatus.IN_REVIEW).length },
    { name: 'Done', value: tasks.documents.filter(task => task.status === TaskStatus.DONE).length },
  ];

  // Chart colors matching TaskStatus colors from the Badge component
  const COLORS = ['#e879f9', '#ef4444', '#eab308', '#3b82f6', '#22c55e'];

  // Prepare data for tasks per project (Bar Chart)
  const projectTasksData = projects.documents.map(project => {
    const projectTasks = tasks.documents.filter(task => 
      task.project && task.project.$id === project.$id
    );
    return {
      name: project.name,
      tasks: projectTasks.length,
      backlog: projectTasks.filter(task => task.status === TaskStatus.BACKLOG).length,
      todo: projectTasks.filter(task => task.status === TaskStatus.TODO).length,
      inProgress: projectTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      inReview: projectTasks.filter(task => task.status === TaskStatus.IN_REVIEW).length,
      done: projectTasks.filter(task => task.status === TaskStatus.DONE).length
    };
  });

  // Calculate task completion rate
  const calculateCompletionRate = () => {
    if (tasks.total === 0) return 0;
    return Math.round((tasks.documents.filter(task => task.status === TaskStatus.DONE).length / tasks.total) * 100);
  };

  // Count active members (exclude admins if needed)
  const activeMembersCount = members.documents.filter(member => member.role !== MemberRole.ADMIN).length;

  // Prepare data for monthly task completion trends (Line Chart)
  // In a real app, this would be based on actual date data
  const currentDate = new Date();
  const monthlyTaskData = [
    { name: 'Jan', completed: Math.round(analytics.completedTaskCount * 0.2), created: Math.round(analytics.taskCount * 0.25) },
    { name: 'Feb', completed: Math.round(analytics.completedTaskCount * 0.4), created: Math.round(analytics.taskCount * 0.45) },
    { name: 'Mar', completed: Math.round(analytics.completedTaskCount * 0.7), created: Math.round(analytics.taskCount * 0.75) },
    { name: 'Apr', completed: analytics.completedTaskCount, created: analytics.taskCount }
  ];

  // Prepare data for member workload distribution (Bar Chart)
  const memberTasksData = members.documents
    .filter(member => member.role !== MemberRole.ADMIN) // Filter out admins if needed
    .map(member => {
      const memberTasks = tasks.documents.filter(task => task.assigneeId === member.$id);
      return {
        name: member.name || "Anonymous User",
        assigned: memberTasks.length,
        completed: memberTasks.filter(task => task.status === TaskStatus.DONE).length,
        overdue: memberTasks.filter(task => {
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          return dueDate && dueDate < currentDate && task.status !== TaskStatus.DONE;
        }).length
      };
    });

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
      </div>
      <DottedSeparator className="my-2" />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Task Completion Rate"
          value={calculateCompletionRate()}
          variant="up"
          increaseVlaue={12}
        />
        <AnalyticsCard
          title="Total Projects"
          value={projects.total}
          variant="up"
          increaseVlaue={0}
        />
        <AnalyticsCard
          title="Active Members"
          value={activeMembersCount}
          variant="up"
          increaseVlaue={0}
        />
        <AnalyticsCard
          title="Avg. Time to Complete"
          value={3.2}
          variant="down"
          increaseVlaue={0.5}
        />
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Member Analytics</TabsTrigger>
          <TabsTrigger value="projects">Project Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Status Distribution Bar Chart */}
            <Card className="analytics-chart-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={{
                    backlog: { theme: { light: COLORS[0], dark: COLORS[0] }, label: "Backlog" },
                    todo: { theme: { light: COLORS[1], dark: COLORS[1] }, label: "To Do" },
                    inProgress: { theme: { light: COLORS[2], dark: COLORS[2] }, label: "In Progress" },
                    inReview: { theme: { light: COLORS[3], dark: COLORS[3] }, label: "In Review" },
                    done: { theme: { light: COLORS[4], dark: COLORS[4] }, label: "Done" }
                  }}
                >
                  <BarChart data={taskStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="value" name="Tasks">
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            {/* Monthly Task Completion Trends Line Chart */}
            <Card className="analytics-chart-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Task Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: { theme: { light: "#22c55e", dark: "#22c55e" }, label: "Completed" },
                    created: { theme: { light: "#3b82f6", dark: "#3b82f6" }, label: "Created" }
                  }}
                >
                  <LineChart data={monthlyTaskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="completed" stroke="#22c55e" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="created" stroke="#3b82f6" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Status Distribution Pie Chart */}
            <Card className="analytics-chart-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Task Status Distribution (Pie)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  config={{
                    backlog: { theme: { light: COLORS[0], dark: COLORS[0] }, label: "Backlog" },
                    todo: { theme: { light: COLORS[1], dark: COLORS[1] }, label: "To Do" },
                    inProgress: { theme: { light: COLORS[2], dark: COLORS[2] }, label: "In Progress" },
                    inReview: { theme: { light: COLORS[3], dark: COLORS[3] }, label: "In Review" },
                    done: { theme: { light: COLORS[4], dark: COLORS[4] }, label: "Done" }
                  }}
                >
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Tasks per Project chart moved from Task Analytics tab to Overview */}
            <Card className="analytics-chart-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tasks per Project</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    backlog: { theme: { light: COLORS[0], dark: COLORS[0] }, label: "Backlog" },
                    todo: { theme: { light: COLORS[1], dark: COLORS[1] }, label: "To Do" },
                    inProgress: { theme: { light: COLORS[2], dark: COLORS[2] }, label: "In Progress" },
                    inReview: { theme: { light: COLORS[3], dark: COLORS[3] }, label: "In Review" }, 
                    done: { theme: { light: COLORS[4], dark: COLORS[4] }, label: "Done" }
                  }}
                >
                  <BarChart data={projectTasksData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="backlog" fill={COLORS[0]} stackId="status" />
                    <Bar dataKey="todo" fill={COLORS[1]} stackId="status" />
                    <Bar dataKey="inProgress" fill={COLORS[2]} stackId="status" />
                    <Bar dataKey="inReview" fill={COLORS[3]} stackId="status" />
                    <Bar dataKey="done" fill={COLORS[4]} stackId="status" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          {/* Member Analytics Tab */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="analytics-chart-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Member Workload Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    assigned: { theme: { light: "#3b82f6", dark: "#3b82f6" }, label: "Assigned" },
                    completed: { theme: { light: "#22c55e", dark: "#22c55e" }, label: "Completed" },
                    overdue: { theme: { light: "#ef4444", dark: "#ef4444" }, label: "Overdue" }
                  }}
                >
                  <BarChart data={memberTasksData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="assigned" fill="#3b82f6" />
                    <Bar dataKey="completed" fill="#22c55e" />
                    <Bar dataKey="overdue" fill="#ef4444" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          {/* Project Analytics Tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="analytics-chart-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { theme: { light: "#3b82f6", dark: "#3b82f6" }, label: "Tasks" }
                  }}
                >
                  <PieChart>
                    <Pie
                      data={projectTasksData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="tasks"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {projectTasksData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card className="analytics-chart-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completionRate: { theme: { light: "#22c55e", dark: "#22c55e" }, label: "Completion Rate" }
                  }}
                >
                  <BarChart data={projectTasksData.map(project => ({
                    name: project.name,
                    completionRate: project.tasks > 0 
                      ? Math.round((project.done / project.tasks) * 100) 
                      : 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completionRate" fill="#22c55e" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};