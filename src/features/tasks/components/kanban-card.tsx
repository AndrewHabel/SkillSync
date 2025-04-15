import { MoreHorizontal } from "lucide-react";
import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { DottedSeparator } from "@/components/dotted-separator";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { TaskDate } from "./task-date";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

interface KanbanCardProps {
    task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
    return (
        <div className="bg-card dark:bg-card p-2.5 rounded shadow-sm space-y-3">
            <div className="flex justify-between items-start gap-x-2">
                <p className="text-sm line-clamp-2 text-card-foreground">{task.name}</p>
                <TaskActions id={task.$id} projectId={task.projectId}>
                    <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-muted-foreground hover:opacity-75 transition"/>
                </TaskActions>
            </div>
            <DottedSeparator />
            <div className="flex items-center gap-x-1.5">
                {task.assignee ? (
                    <MembersAvatar name={task.assignee.name?.name || task.assignee.name} fallbackclassName="text-[10px]"/>
                ) : (
                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                )}
                <div className="size-1 rounded-full bg-muted"/>
                {task.dueDate ? (
                    <TaskDate value={task.dueDate} className="text-xs text-muted-foreground"/>
                ) : (
                    <span className="text-xs text-muted-foreground italic">No due date</span>
                )}
            </div>
            <div className="flex items-center gap-x-1.5">
                {task.project ? (
                    <>
                        <ProjectAvatar name={task.project.name} image={task.project.imageUrl} fallbackClassName="text-[10px]"/>
                        <span className="text-xs font-medium text-card-foreground">{task.project.name}</span>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground italic">No project</span>
                )}
            </div>
        </div>
    );
};