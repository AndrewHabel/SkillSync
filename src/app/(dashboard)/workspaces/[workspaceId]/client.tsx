"use client"

import { Analytics } from "@/components/analytics";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { Plus, PlusIcon, Calendar, CalendarIcon, SettingsIcon, BriefcaseIcon, UsersIcon, CheckSquareIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { Member } from "@/features/members/types";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { motion } from "framer-motion";

export const WorkSpaceIdClient = () => {

    const workspaceId = useWorkspaceId();
    const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const { open: createProject } = useCreateProjectModal();

    const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;
    if (isLoading) return <PageLoader />
    if (!analytics || !tasks || !projects || !members) return <PageError message="Failed to load workspace data" />;

    return (
        <div className="workspace-container h-full flex flex-col space-y-6 fade-in">
            <div className="workspace-analytics-wrapper">
                {analytics && <Analytics data={analytics} />}
            </div>
            <div className="flex flex-col space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TaskList data={tasks.documents} total={tasks.total} />
                    <ProjectList data={projects.documents} total={projects.total} />
                </div>
                <MembersList data={members.documents} total={members.total} />
            </div>
        </div>
    )
}

interface TaskListProps {
    data: Task[];
    total: number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();

    return (
        <div className="workspace-section scale-in w-full">
            <div className="workspace-section-header">
                <div className="flex items-center">
                    <CheckSquareIcon className="size-5 mr-2 text-primary" />
                    <p className="workspace-section-title">Tasks ({total})</p>
                </div>
                <Button variant="outline" size="icon" onClick={createTask} className="workspace-button-outline rounded-full">
                    <PlusIcon className="size-4" />
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            <div className={`${data.length > 3 ? 'max-h-[450px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                <ul className="flex flex-col gap-y-3 mt-5">
                    {data.map((task, index) => (
                        <li key={task.$id}>
                            <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3}}
                                    whileHover={{ scale: 1.0001 }}
                                >
                                    <Card className="workspace-card workspace-task-card shadow-none">
                                        <CardContent className="p-4">
                                            <p className="workspace-task-title">
                                                {task.name}
                                            </p>
                                            <div className="flex items-center gap-x-2">
                                                <span className="task-status task-status-todo">
                                                    {task.status}
                                                </span>
                                                <div className="size-1 rounded-full bg-neutral-300" />
                                                <div className="workspace-task-info">
                                                    <CalendarIcon className="size-3 mr-1" />
                                                    <span>
                                                        {formatDistanceToNow(new Date(task.dueDate))}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Link>
                        </li>
                    ))}
                    {data.length === 0 && (
                        <li className="workspace-empty-state">
                            <div className="workspace-empty-state-icon">
                                <CheckSquareIcon className="size-10" />
                            </div>
                            <p className="workspace-empty-state-text">No tasks found</p>
                            <Button variant="outline" onClick={createTask} className="workspace-button workspace-button-outline">
                                <PlusIcon className="size-4 mr-2" /> Add Task
                            </Button>
                        </li>
                    )}
                </ul>
            </div>
            {data.length > 0 && (
                <Button variant="outline" className="mt-4 w-full workspace-button workspace-button-outline" asChild>
                    <Link href={`/workspaces/${workspaceId}/tasks`}>View All Tasks</Link>
                </Button>
            )}
        </div>
    );
};

interface ProjectListProps {
    data: Project[];
    total: number;
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();
    const { open: createProject } = useCreateProjectModal();

    return (
        <div className="workspace-section scale-in w-full" style={{ animationDelay: "0.1s" }}>
            <div className="workspace-section-header">
                <div className="flex items-center">
                    <BriefcaseIcon className="size-5 mr-2 text-primary" />
                    <p className="workspace-section-title">
                        Projects ({total})
                    </p>
                </div>
                <Button variant="outline" size="icon" onClick={createProject} className="workspace-button-outline rounded-full">
                    <PlusIcon className="size-4" />
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            <div className={`${data.length > 3 ? 'max-h-[450px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                {data.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-4">
                        {data.map((project, index) => (
                            <li key={project.$id}>
                                <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <Card className="workspace-card workspace-project-card shadow-none">
                                            <CardContent className="p-4 flex items-center gap-x-3">
                                                <ProjectAvatar
                                                    className="workspace-project-avatar"
                                                    fallbackClassName="text-lg"
                                                    name={project.name}
                                                    image={project.imageUrl}
                                                />
                                                <div className="workspace-project-info">
                                                    <p className="workspace-project-title">
                                                        {project.name}
                                                    </p>
                                                    <p className="workspace-project-tech">
                                                        {project.ProjectTechStack.join(" • ")}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="workspace-empty-state">
                        <div className="workspace-empty-state-icon">
                            <BriefcaseIcon className="size-10" />
                        </div>
                        <p className="workspace-empty-state-text">No projects found</p>
                        <Button variant="outline" onClick={createProject} className="workspace-button workspace-button-outline">
                            <PlusIcon className="size-4 mr-2" /> Create Project
                        </Button>
                    </div>
                )}
            </div>
            {data.length > 0 && (
                <Button variant="outline" className="mt-4 w-full workspace-button workspace-button-outline" asChild>
                    <Link href={`/workspaces/${workspaceId}/projects`}>View All Projects</Link>
                </Button>
            )}
        </div>
    );
};

interface MembersListProps {
    data: Member[];
    total: number;
}

export const MembersList = ({ data, total }: MembersListProps) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();

    return (
        <div className="workspace-section scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="workspace-section-header">
                <div className="flex items-center">
                    <UsersIcon className="size-5 mr-2 text-primary" />
                    <p className="workspace-section-title">
                        Members ({total})
                    </p>
                </div>
                <Button asChild variant="outline" size="icon" className="workspace-button-outline rounded-full">
                    <Link href={`/workspaces/${workspaceId}/members`}>
                        <SettingsIcon className="size-4" />
                    </Link>
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            {data.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((member, index) => (
                        <li key={member.$id}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <Card className="workspace-card workspace-member-card shadow-none">
                                    <CardContent className="p-3 flex flex-col items-center">
                                        <MembersAvatar className="workspace-member-avatar" imageUrl={member.imageUrl} name={member.name} />
                                        <div className="overflow-hidden text-center">
                                            <p className="workspace-member-name">
                                                {member.name}
                                            </p>
                                            <p className="workspace-member-email">
                                                {member.email}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="workspace-empty-state">
                    <div className="workspace-empty-state-icon">
                        <UsersIcon className="size-10" />
                    </div>
                    <p className="workspace-empty-state-text">No members found</p>
                    <Button variant="outline" className="workspace-button workspace-button-outline" asChild>
                        <Link href={`/workspaces/${workspaceId}/members`}>
                            <PlusIcon className="size-4 mr-2" /> Add Members
                        </Link>
                    </Button>
                </div>
            )}
            {data.length > 0 && (
                <Button variant="outline" className="mt-4 w-full workspace-button workspace-button-outline" asChild>
                    <Link href={`/workspaces/${workspaceId}/members`}>Manage Members</Link>
                </Button>
            )}
        </div>
    );
};