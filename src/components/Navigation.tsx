"use client";
// navigation.tsx
import { cn } from '@/lib/utils';
import { BarChart2Icon, GithubIcon, SettingsIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from 'react-icons/go';
import type { IconType } from 'react-icons';
import { usePathname } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useCurrent } from '@/features/auth/api/use-current';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { MemberRole } from '@/features/members/types';
import { useEffect, useState } from 'react';

// Define route interface with optional adminOnly property
interface RouteItem {
    label: string;
    href: string;
    icon: IconType | React.ForwardRefExoticComponent<any>;
    activeIcon: IconType | React.ForwardRefExoticComponent<any>;
    adminOnly?: boolean;
}

// Base routes available to all users
const routes: RouteItem[] = [
    {
        label: "Home",
        href: "",
        icon: GoHome,
        activeIcon: GoHomeFill
    },
    {
        label: "My Tasks",
        href: "/my-tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
    },
    {
        label: "GitHub",
        href: "/github-integration",
        icon: GithubIcon,
        activeIcon: GithubIcon,
        adminOnly: true, // Only ADMIN can see GitHub
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon,
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activeIcon: UsersIcon,
    }
];

const adminRoutes: RouteItem[] = [
    {
        label: "Admin Analytics",
        href: "/admin-analytics",
        icon: BarChart2Icon,
        activeIcon: BarChart2Icon,
        adminOnly: true,
    }
];

export const Navigation = () => {
    const workspaceId = useWorkspaceId();
    const pathname = usePathname();
    const { data: user } = useCurrent();
    const { data: members } = useGetMembers({ workspaceId });
    const [isAdmin, setIsAdmin] = useState(false);    // Determine if current user is an admin
    useEffect(() => {
        if (members && user) {
            const currentUserMember = members.documents.find(member => member.userId === user.$id);
            setIsAdmin(currentUserMember?.role === MemberRole.ADMIN);
        }
    }, [members, user]);

    // Filter routes based on user role
    const filteredRoutes = routes.filter(route => {
        // Hide adminOnly routes for non-admin users
        if (route.adminOnly && !isAdmin) {
            return false;
        }
        // Hide "My Tasks" for admins (if that's the intended behavior)
        if (isAdmin && route.label === "My Tasks") {
            return false;
        }
        return true;
    });
    
    const allRoutes = [...filteredRoutes, ...(isAdmin ? adminRoutes : [])];

    return (
        <ul className="flex flex-col gap-1">
            {allRoutes.map((item) => {
                // Special case for GitHub integration which is in standalone layout
                if (item.label === "GitHub") {
                    const isActive = pathname === "/github-integration";
                    const Icon = isActive ? item.activeIcon : item.icon;
                    
                    return (
                        <li key={item.href}>
                            <Link
                                href="/github-integration"
                                className={cn(
                                    "flex items-center gap-2.5 p-2.5 rounded-md font-medium transition-all duration-300 ease-in-out group text-muted-foreground hover:text-primary hover:bg-accent",
                                    isActive && "bg-card shadow-sm hover:opacity-100 text-primary"
                                )}
                            >
                               <Icon className={cn(
                                    "size-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary group-hover:scale-110",
                                    isActive && "text-primary"
                                )} />
                                <span className="group-hover:translate-x-2 transition-transform duration-300">
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    );
                }
                
                // Regular workspace routes
                const fullHref = `/workspaces/${workspaceId}${item.href}`;
                const isActive = pathname === fullHref;
                const Icon = isActive ? item.activeIcon : item.icon;

                return (
                    <li key={item.href}>
                        <Link
                            href={fullHref}
                            className={cn(
                                "flex items-center gap-2.5 p-2.5 rounded-md font-medium transition-all duration-300 ease-in-out group text-muted-foreground hover:text-primary hover:bg-accent",
                                isActive && "bg-card shadow-sm hover:opacity-100 text-primary",
                                item.adminOnly && "text-muted-foreground"
                            )}
                        >
                           <Icon className={cn(
                                "size-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary group-hover:scale-110",
                                isActive && "text-primary",
                                item.adminOnly && "text-muted-foreground"
                            )} />
                            <span className="group-hover:translate-x-2 transition-transform duration-300">
                                {item.label}
                            </span>
                        </Link>
                    </li>
                )
            })}
        </ul>
    );
};