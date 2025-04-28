import { DottedSeparator } from "@/components/dotted-separator";
import { Badge } from "@/components/ui/badge";
import { Task, getPreferredRoleDisplay } from "../types";
import { ClockIcon, TargetIcon } from "lucide-react";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { TaskDate } from "./task-date";

interface TaskDetailsProps {
    task: Task;
};

export const TaskDetails = ({ task }: TaskDetailsProps) => {
    return (
        <div className="p-4 border rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex flex-col gap-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Project</p>
                        <div className="flex items-center gap-x-2">
                            {task.project ? (
                                <>
                                    <ProjectAvatar name={task.project.name} image={task.project.imageUrl} />
                                    <p className="font-semibold">{task.project.name}</p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No Project</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Assignee</p>
                        <div className="flex items-center gap-x-2">
                            {task.assignee ? (
                                <>
                                    <MembersAvatar name={task.assignee.name} />
                                    <p className="font-semibold">{task.assignee.name}</p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">No Assignee</p>
                            )}
                        </div>
                    </div>
                </div>
                <DottedSeparator className="block sm:hidden my-4" />
                <div className="flex flex-col gap-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <div className="flex items-center gap-x-2">
                            {task.dueDate ? (
                                <TaskDate value={task.dueDate} className="font-semibold" />
                            ) : (
                                <p className="text-sm text-muted-foreground">No Due Date</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="outline" className="bg-neutral-300 dark:bg-neutral-800 text-card-foreground">
                            {task.status.replace(/_/g, " ")}
                        </Badge>
                    </div>
                </div>
                <DottedSeparator className="block sm:hidden my-4" />
                <div className="flex flex-col gap-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Preferred Role</p>
                        <div className="flex items-center gap-x-2">
                            {task.preferredRole ? (
                                <div className="flex items-center gap-x-2">
                                    <TargetIcon className="size-4 text-muted-foreground" />
                                    <p className="font-semibold">{getPreferredRoleDisplay(task.preferredRole)}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Any Role</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Estimated Hours</p>
                        <div className="flex items-center gap-x-2">
                            {task.estimatedHours ? (
                                <div className="flex items-center gap-x-2">
                                    <ClockIcon className="size-4 text-muted-foreground" />
                                    <p className="font-semibold">{task.estimatedHours} {task.estimatedHours === 1 ? 'hour' : 'hours'}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not specified</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};