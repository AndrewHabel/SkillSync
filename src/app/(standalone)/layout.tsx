import Link from "next/link";
import React from "react";
import Image from "next/image";
import { UserButton } from "@/features/auth/components/user-button";
interface StandalinLayoutProps {
    children: React.ReactNode;
}
const StandalinLayout = ({children}:StandalinLayoutProps) => {
    return (
        <main className="bg-netural-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px]">
                    <Link href="/">
                        <Image src="/logo.svg" alt="logo" height={65} width={152} />
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