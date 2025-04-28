import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { Clock, PencilIcon, User, Calendar, BarChart } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { OverviewProperty } from "./overview-property";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { getPreferredRoleDisplay } from "../types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskOverviewProps {
    task: Task;
};

export const TaskOverview = ({ task }: TaskOverviewProps) => {
    const { open } = useEditTaskModal();

    // Define animation variants for smooth transitions
    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: "spring",
                stiffness: 100,
                damping: 15,
                staggerChildren: 0.1
            } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: "spring",
                stiffness: 100,
                damping: 15
            } 
        }
    };

    return (
        <motion.div 
            className="flex flex-col gap-y-4 col-span-1"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div 
                className="bg-muted/80 rounded-lg p-5 shadow-sm border border-border/50 hover:border-border/80 transition-colors"
                variants={itemVariants}
            >
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-base font-semibold">Task Overview</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    onClick={() => open(task.$id)} 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 px-3 hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <PencilIcon className="size-3.5 mr-1" />
                                    Edit
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Edit task details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <DottedSeparator className="my-3" />

                <div className="flex flex-col gap-y-5">
                    <motion.div variants={itemVariants}>
                        <OverviewProperty label="Assignee" icon={<User className="size-4 text-muted-foreground" />}>
                            <div className="flex items-center gap-x-3">
                                <MembersAvatar name={task.assignee.name} className="size-7 border-2 border-background" />
                                <p className="text-sm font-medium">{task.assignee.name}</p>
                            </div>
                        </OverviewProperty>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <OverviewProperty label="Due Date" icon={<Calendar className="size-4 text-muted-foreground" />}>
                            <TaskDate value={task.dueDate} className="text-sm font-medium py-1 px-2 bg-muted/70 rounded-md" />
                        </OverviewProperty>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <OverviewProperty label="Status" icon={<BarChart className="size-4 text-muted-foreground" />}>
                            <Badge variant={task.status} className="py-1">
                                {snakeCaseToTitleCase(task.status)}
                            </Badge>
                        </OverviewProperty>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <OverviewProperty label="Estimated Hours" icon={<Clock className="size-4 text-muted-foreground" />}>
                            <p className={cn(
                                "text-sm font-medium py-1 px-3 rounded-md", 
                                task.estimatedHours ? "bg-muted/70" : "text-muted-foreground italic"
                            )}>
                                {task.estimatedHours ? `${task.estimatedHours} hours` : 'Not specified'}
                            </p>
                        </OverviewProperty>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <OverviewProperty label="Preferred Role" icon={<User className="size-4 text-muted-foreground" />}>
                            <Badge 
                                variant="outline" 
                                className={cn(
                                    "py-1 font-normal", 
                                    task.preferredRole ? "border-primary/30 bg-primary/5" : ""
                                )}
                            >
                                {task.preferredRole ? getPreferredRoleDisplay(task.preferredRole) : 'Not specified'}
                            </Badge>
                        </OverviewProperty>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

