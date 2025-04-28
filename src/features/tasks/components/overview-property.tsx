import { cn } from "@/lib/utils";
import React from "react";

interface OverviewPropertyProps {
    label: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
};

export const OverviewProperty = ({ label, children, icon }: OverviewPropertyProps) => {
    return (
        <div className="flex items-start gap-x-3">
            <div className={cn(
                "flex min-w-[120px] items-center gap-x-2"
            )}>
                {icon && (
                    <span>{icon}</span>
                )}
                <p className="text-sm text-muted-foreground">
                    {label}
                </p>
            </div>
            <div className="flex flex-1 items-center gap-x-2">
                {children}
            </div>  
        </div>
    );
};