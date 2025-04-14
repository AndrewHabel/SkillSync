"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserButton } from "@/features/auth/components/user-button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface StandalinLayoutProps {
    children: React.ReactNode;
}

const StandalinLayout = ({children}:StandalinLayoutProps) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Only render theme-specific components after mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Get the appropriate logo based on the current theme
    const getLogo = () => {
        if (!mounted) return "/logo.svg"; // Default logo during SSR

        switch (theme) {
            case "dracula":
                return "/logo-dracula.svg";
            case "nord":
                return "/logo-nord.svg";
            default:
                return "/logo.svg";
        }
    };

    return (
        <main className={cn(
            "min-h-screen bg-background transition-colors duration-200"
        )}>
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px]">
                    <Link href="/">
                        <Image src={getLogo()} alt="logo" height={65} width={152} />
                    </Link>
                    <UserButton />
                </nav>
                <div className="flex flex-col items-center justify-center py-4">
                     {children}
                </div>
            </div>
        </main>
    );  
};

export default StandalinLayout;