import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskDateProps {
    value: string | null | undefined;
    className?: string;
};

export const TaskDate = ({value, className}: TaskDateProps) => {
    // If no value is provided, return "No due date"
    if (!value) {
        return (
            <span className={cn("text-muted-foreground italic", className)}>
                No due date
            </span>
        );
    }
    
    const today = new Date();
    const endDate = new Date(value);
    const daysDifference = differenceInDays(endDate, today);

    let textColor ="text-muted-foreground";

    if (daysDifference <= 3) {
        textColor = "text-red-500";
    } else if (daysDifference <= 7) {
        textColor = "text-orange-500";
    } else if (daysDifference <= 14) {
        textColor = "text-yellow-500";
    }

    return (
       <div className={textColor}>
          <span className={cn("truncate", className)}>
            { format(value, "PPP") }
          </span>  
       </div>
    )
}