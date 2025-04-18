import { ProjectAnalyticsResponceType } from "@/features/projects/api/use-get-project-analytics";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";
import { motion } from "framer-motion";
import { CheckCircle2Icon, ClockIcon, ListTodoIcon, AlertTriangleIcon, UserIcon } from "lucide-react";

export const Analytics = ({ data }: ProjectAnalyticsResponceType) => {
    if (!data) return null;
    
    const analyticsItems: {
        title: string;
        value: number;
        variant: "up" | "down";
        increaseValue: number;
        icon: JSX.Element;
        color: string;
    }[] = [
        {
            title: "Total Tasks",
            value: data.taskCount,
            variant: data.taskDifference > 0 ? "up" : "down",
            increaseValue: data.taskDifference,
            icon: <ListTodoIcon className="size-5 text-primary" />,
            color: "bg-blue-100 dark:bg-blue-950"
        },
        {
            title: "Assigned Tasks",
            value: data.assignedTaskCount,
            variant: data.assignedTaskDifference > 0 ? "up" : "down",
            increaseValue: data.assignedTaskDifference,
            icon: <UserIcon className="size-5 text-purple-500" />,
            color: "bg-purple-100 dark:bg-purple-950"
        },
        {
            title: "Completed Tasks",
            value: data.completedTaskCount,
            variant: data.completedTaskDifference > 0 ? "up" : "down",
            increaseValue: data.completedTaskDifference,
            icon: <CheckCircle2Icon className="size-5 text-green-500" />,
            color: "bg-green-100 dark:bg-green-950"
        },
        {
            title: "Overdue Tasks",
            value: data.OverdueTaskCount,
            variant: data.OverdueTaskDifference > 0 ? "up" : "down",
            increaseValue: data.OverdueTaskDifference,
            icon: <AlertTriangleIcon className="size-5 text-red-500" />,
            color: "bg-red-100 dark:bg-red-950"
        },
        {
            title: "Incomplete Tasks",
            value: data.incompleteTaskCount,
            variant: data.incompleteTaskDifference > 0 ? "up" : "down",
            increaseValue: data.incompleteTaskDifference,
            icon: <ClockIcon className="size-5 text-amber-500" />,
            color: "bg-amber-100 dark:bg-amber-950"
        }
    ];

    return (
        <div className="workspace-analytics-wrapper mb-4">
            <ScrollArea className="workspace-analytics-card w-full whitespace-nowrap">
                <div className="w-full flex flex-row items-stretch">
                    {analyticsItems.map((item, index) => (
                        <motion.div 
                            key={item.title}
                            className="flex items-center flex-1"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="py-4 px-6 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`rounded-full p-2 ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
                                </div>
                                <AnalyticsCard 
                                    title={item.title}
                                    value={item.value} 
                                    variant={item.variant} 
                                    increaseVlaue={item.increaseValue}
                                />
                            </div>
                            {index < analyticsItems.length - 1 && (
                                <DottedSeparator direction="vertical" className="h-16" />
                            )}
                        </motion.div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}