import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { RotatingText } from "./rotating-text";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const FeatureItem = ({ text }: { text: string }) => (
  <motion.div 
    className="flex items-center gap-3 text-base md:text-lg"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <CheckCircle className="text-blue-500 w-6 h-6 flex-shrink-0" />
    <span>{text}</span>
  </motion.div>
);

export const HeroLandingPage = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLogo = () => {
    if (!mounted) return "/logo.svg";

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
    <div className="relative w-full min-h-[95vh] overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50 dark:to-blue-950/20 -z-10 opacity-70"></div>
      
      <div className="absolute -z-10 top-0 left-0 right-0 bottom-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-6 py-16 md:py-28 flex flex-col items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full max-w-7xl">

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-base md:text-lg font-semibold text-blue-600 dark:text-blue-400 tracking-wide mb-3">PROJECT MANAGEMENT REIMAGINED</h2>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Supercharge Your Workflow with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">SkillSync</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                Tired of juggling tasks, deadlines, and team coordination? Meet the next-generation project management platform that combines the power of AI with intuitive task tracking.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 mb-10"
            >
              <FeatureItem text="AI-powered task allocation" />
              <FeatureItem text="Smart deadline management" />
              <FeatureItem text="Code generation tools" />
              <FeatureItem text="Real-time collaboration" />
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button className="landing-page-button group relative inline-flex h-14 min-w-48 overflow-hidden rounded-lg p-[3px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-4 focus:ring-offset-slate-50 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_6px_-5px_rgba(0,0,0,0.4)]">
                <span className="blue-bg absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center rounded-lg justify-center gap-2 bg-blue-600 px-6 py-2 text-xl font-medium text-white backdrop-blur-3xl hover:bg-blue-700 transition-colors duration-300">
                  <Link href="/workspaces/create" className="flex items-center gap-2 text-card-foreground">
                    Get Started
                    <ArrowRight className="text-card-foreground w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </span>
              </Button>
              
              <Button variant="outline" className="h-14 min-w-48 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-lg">
                <Link href="#demo" className="flex items-center gap-2">
                  Watch Demo
                </Link>
              </Button>
            </motion.div>
            
            <motion.div 
              className="mt-10 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
            </motion.div>
          </div>
          
          <div className="flex flex-col items-center justify-center order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-full p-10 shadow-xl">
                <Image 
                  src={getLogo()} 
                  alt="SkillSync logo" 
                  width={500} 
                  height={500} 
                  className="w-full max-w-[350px] md:max-w-[450px] object-contain relative z-10"
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-base text-gray-600 dark:text-gray-400 mb-3">Powered by AI for</p>
              <div className="text-2xl font-semibold">
                <RotatingText
                  texts={["Task Allocation", "Task Generation", "Code Initial Generation", "Team Coordination"]}
                  mainClassName="w-fit px-4 py-3 blue-bg white-text overflow-hidden rounded-md shadow-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};