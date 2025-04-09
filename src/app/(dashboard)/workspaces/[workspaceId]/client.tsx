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
import { Plus, PlusIcon ,Calendar, CalendarIcon, SettingsIcon} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {Card , CardContent} from "@/components/ui/card";
import Link from "next/link";
import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { Member } from "@/features/members/types";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { motion } from "framer-motion";

export const WorkSpaceIdClient = () => {

    const workspaceId = useWorkspaceId();
    const {data:analytics, isLoading: isLoadingAnalytics} = useGetWorkspaceAnalytics({workspaceId});
    const {data:tasks, isLoading: isLoadingTasks} = useGetTasks({workspaceId});
    const {data:projects, isLoading: isLoadingProjects} = useGetProjects({workspaceId});
    const {data:members, isLoading: isLoadingMembers} = useGetMembers({workspaceId});

    const {open:createProject} = useCreateProjectModal();

    const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;
    if (isLoading) return <PageLoader />
    if (!analytics || !tasks || !projects || !members) return <PageError message="Failed to load workspace data"/>;

    return (
        <div className="h-full flex flex-col space-y-4">
            {analytics && <Analytics data={analytics} />}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TaskList data={tasks.documents} total={tasks.total}/>
                <ProjectList data={projects.documents} total={projects.total}/>
                <MembersList data={members.documents} total={members.total}/>
            </div>
        </div>
    )
}

interface TaskListProps{
    data:Task[];
    total:number;
}

export const TaskList = ({ data, total }: TaskListProps) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">Tasks ({total})</p>
                    <Button variant="muted" size="icon" onClick={createTask}>
                        <PlusIcon className="size-4 text-neutral-400" />
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="flex flex-col gap-y-4">
                    {data.map((task, index) => (
                        <li key={task.$id}>
                            <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                                {/* Animated Card */}
                                <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <Card className="shadow-none rounded-lg hover:opacity-75 transition group">
                                            <CardContent className="p-4">
                                                <p className="text-lg font-medium truncate group-hover:text-blue-600 transition-colors">
                                                    {task.name}
                                                </p>
                                                <div className="flex items-center gap-x-2">
                                                    <p>{task.project?.name}</p>
                                                    <div className="size-1 rounded-full bg-neutral-300" />
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <CalendarIcon className="size-3 mr-1" />
                                                       <span className="truncate group-hover:text-blue-600 transition-colors" >
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
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No tasks found
                    </li>
                </ul>
                <Button variant="muted" className="mt-4 w-full" asChild>
                    <Link href={`/workspaces/${workspaceId}/tasks`}>Show All</Link>
                </Button>
            </div>
        </div>
    );
};

interface ProjectListProps{
    data:Project[];
    total:number;
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();
    const { open: createProject } = useCreateProjectModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Projects ({total})
                    </p>
                    <Button variant="secondary" size="icon" onClick={createProject}>
                        <PlusIcon className="size-4 text-neutral-400" />
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.map((project) => (
                        <li key={project.$id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Card className="shadow-none rounded-lg hover:opacity-95 transition group">
                                        <CardContent className="p-4 flex items-center gap-x-2.5">
                                            <ProjectAvatar
                                                className="size-12"
                                                fallbackClassName="text-lg"
                                                name={project.name}
                                                image={project.imageUrl}
                                            />
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <p className="text-lg font-medium truncate group-hover:text-blue-600 transition-colors">
                                                    {project.name}
                                                </p>
                                                <p className="text-sm font-medium truncate group-hover:text-blue-600 transition-colors">
                                                    {project.ProjectTechStack.join(" , ")}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Link>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No Projects found
                    </li>
                </ul>
            </div>
        </div>
    );
};



interface MembersListProps{
    data:Member[];
    total:number;
}

export const MembersList = ({data,total}:MembersListProps) => {

    const {open:createTask} = useCreateTaskModal();
    const workspaceId = useWorkspaceId();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Members ({total})
                    </p>
                    <Button asChild variant="secondary" size="icon" >
                        <Link href={`/workspaces/${workspaceId}/members`}>
                            <SettingsIcon className="size-4 text-neutral-400"/>
                        </Link>   
                    </Button>
                </div>
                <DottedSeparator className="my-4"/>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((member) => (
                        <li key={member.$id}>
                            <Card className="shadow-none rounded-lg overflow-hidden">
                                <CardContent className="p-3 flex flex-col items-center gap-x-2">
                                    <MembersAvatar className="size-12" name={member.name} />
                                    <div className="flex flex-col items-center overflow-hidden">
                                        <p className="text-lg font-medium line-clamp-1">
                                            {member.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {member.email}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No Members found
                    </li>
                </ul>
            </div>
        </div>
    )
}