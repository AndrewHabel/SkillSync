"use client"

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FooterAuroraGradient } from "@/components/fotter";
import { Models } from "node-appwrite";
import { UserButton } from "@/features/auth/components/user-button";
import { useGetMemberProfile } from "@/features/members/api/use-get-member";


interface LandingPageClientProps {
  user: Models.User<any> | null;
}

export const LandingNav = ({ user }: LandingPageClientProps) => {

    if(!user){
        return (
            <nav className=" flex flex-wrap justify-between items-center w-full h-[73px] md:h-[80px] px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6">
                <Link href="/"></Link>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button className="group mt-8 relative inline-flex h-12 min-w-[120px] md:w-32 overflow-hidden rounded-lg p-[3px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-4 focus:ring-offset-slate-50 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_6px_-5px_rgba(0,0,0,0.4)]">
                        <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center rounded-lg justify-center gap-2 bg-blue-950 px-6 py-2 text-lg font-medium text-white backdrop-blur-3xl hover:bg-slate-800 transition-colors duration-300">
                            <Link href="/sign-in" className="flex items-center gap-2">
                                Login in
                            </Link>
                        </span>
                    </Button>
    
                    <Button className="group mt-8 relative inline-flex h-12 min-w-[120px] md:w-32 overflow-hidden rounded-lg p-[3px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-4 focus:ring-offset-slate-50 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_6px_-5px_rgba(0,0,0,0.4)]">
                        <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center rounded-lg justify-center gap-2 bg-blue-950 px-6 py-2 text-lg font-medium text-white backdrop-blur-3xl hover:bg-slate-800 transition-colors duration-300">
                            <Link href="/sign-in" className="flex items-center gap-2">
                                sign up
                            </Link>
                        </span>
                    </Button>
                </div>
            </nav>
        );  
    }
    return (
        <nav className=" flex flex-wrap justify-between items-center w-full h-[73px] md:h-[80px] px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6">
            <Link href="/"></Link>
            <div className="flex flex-wrap justify-center gap-4">
                <UserButton />
            </div>
        </nav>
    )
    
};
