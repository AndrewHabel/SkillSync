import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { cn } from "@/lib/utils";
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

interface AnalyticsCardProps {
    title: string;
    value: number;
    variant: "up" | "down";
    increaseVlaue: number;
}

export const AnalyticsCard = ({ title, value, variant, increaseVlaue }: AnalyticsCardProps) => {
    const iconColor = variant === "up" ? "text-emerald-500" : "text-red-500";
    const increaceValueColor = variant === "up" ? "text-emerald-500" : "text-red-500";
    const icon = variant === "up" ? <FaCaretUp className={cn(iconColor, "size-4")} /> : <FaCaretDown className={cn(iconColor, "size-4")} />;
    
    // Use absolute value for display but keep the color indicating direction
    const displayValue = Math.abs(increaseVlaue);
    const changeText = variant === "up" ? "increase" : "decrease";

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            <Card className="shadow-none border-none w-full">
                <CardHeader className="p-2">
                    <div className="flex items-center gap-x-3">
                        <CardTitle className="text-3xl font-bold tracking-tight">
                            {value}
                        </CardTitle>
                        <div className={cn("flex items-center gap-x-1 px-2 py-1 rounded-full", 
                            variant === "up" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30")}>
                            {icon}
                            <span className={cn(increaceValueColor, "text-xs font-medium")}>
                                {displayValue} {changeText}
                            </span>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </motion.div>
    );
}