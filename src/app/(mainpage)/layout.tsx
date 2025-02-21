"use client"

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface StandalinLayoutProps {
    children: React.ReactNode;
}
export const landingPageLayout = ({children}:StandalinLayoutProps) => {
    return (
        <main className="bg-neutral-100 min-h-screen overflow-hidden">
            <div className="mx-auto max-w-screen-2xl">
                <nav className=" flex flex-wrap justify-between items-center w-full h-[73px] md:h-[80px] px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6">
                    <Link href="/">
                    </Link>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button className="group relative inline-flex h-12 w-full md:w-32 overflow-hidden rounded-xl p-[3px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-4 focus:ring-offset-slate-50 transition-transform duration-300">
                                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-4 sm:px-6 py-2 text-base md:text-lg font-medium text-white backdrop-blur-3xl transition-colors duration-300 group-hover:bg-yellow-50 group-hover:text-blue-950">
                                <Link href="/sign-in">
                                        Login
                                    </Link>
                                </span>
                            </Button>

                            <Button className="group relative inline-flex h-12 w-full md:w-32 overflow-hidden rounded-xl p-[3px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-4 focus:ring-offset-slate-50 transition-transform duration-300">
                                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-4 sm:px-6 py-2 text-base md:text-lg font-medium text-white backdrop-blur-3xl transition-colors duration-300 group-hover:bg-yellow-50 group-hover:text-blue-950">
                                    <Link href="/sign-up">
                                        Signup
                                    </Link>
                                </span>
                            </Button>
                        </div>
                </nav>
                <div className="flex flex-col items-center justify-center">
                     {children}
                </div>
            </div>
        </main>
    );  
};

export default landingPageLayout;