"use client";

import { UserButton } from "@/features/auth/components/user-button"
import { MobileSidebar } from "./mobile-sidebar"
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrent } from "@/features/auth/api/use-current";
import { Badge } from "@/components/ui/badge";

const pathnameMap = {
    "tasks":{
        title: "Tasks",
        description: "View all of your tasks here"
    },
    "projects":{
        title: "My Project",
        description: "View all the tasks of your project here"
    },
    "my-tasks": {
        title: "My Tasks",
        description: "Monitor all tasks assigned to you here"
    },
    "admin-analytics": {
        title: "Admin Analytics",
        description: "View workspace analytics and performance metrics"
    },
}   

const defaultMap = {
   title: "Home",
   description: "Monitor all of your projects and tasks here"
}

export const Navbar = () => {

    const workspaceId = useWorkspaceId();
    const { data: user } = useCurrent();
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
    const pathname = usePathname();
    const pathnameParts = pathname.split("/");
    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;
    const { title, description } = pathnameMap[pathnameKey] || defaultMap;
    const currentMember = members?.documents.find(member => member.userId === user?.$id);
    console.log("Current Member soekjseoibjsroibjiorbjsobjobij:", currentMember);
    return (
        <nav className="pt-4 px-6 flex items-center justify-between">            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">
                    {title}
                    {currentMember?.specialRole?.documents?.[0]?.roleName && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                            {currentMember.specialRole.documents[0].roleName}
                        </Badge>
                    )}
                </h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            
            <div className="flex items-center gap-4">
                <ModeToggle />
                <MobileSidebar />
                <UserButton />
            </div>
        </nav>
    )
}