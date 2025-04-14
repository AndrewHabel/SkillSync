import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdSettingsClient } from "./client";
import { cn } from "@/lib/utils";

const WorkspaceIdSettingsPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("http://localhost:3000/landingpage");

    return (
        <div className={cn(
            "flex min-h-screen w-full items-center justify-center bg-background",
            "p-6 transition-colors duration-200"
        )}>
            <WorkspaceIdSettingsClient />
        </div>
    );
}

export default WorkspaceIdSettingsPage;