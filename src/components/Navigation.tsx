"use client";
// navigation.tsx
import { cn } from '@/lib/utils';
import { SettingsIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from 'react-icons/go';
import { usePathname } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
const routes = [
    {
        label: "Home",
        href: "",
        icon: GoHome,
        activeIcon: GoHomeFill
    },
    {
        label: "My Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
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

export const Navigation = () => {
    const workspaceId = useWorkspaceId();
    const pathname = usePathname();
    return (
        <ul className="flex flex-col gap-1">
            {routes.map((item) => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`;
                const isActive = pathname === fullHref;
                const Icon = isActive ? item.activeIcon : item.icon;

                return (
                    <li key={item.href}>
                        <Link
                            href={fullHref}
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
                )
            })}
        </ul>
    );
};