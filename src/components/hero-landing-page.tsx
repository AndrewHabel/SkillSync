import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RotatingText } from "./rotating-text";
import { motion } from "framer-motion";
import React from "react";


interface AnimatedTextProps {
  text?: React.ReactNode; 
  time: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text ,time }) => {
  const words = React.Children.toArray(text).flatMap((node) =>
    typeof node === "string" ? node.split("\n") : [node]
  );

  return (
    <motion.span className="inline-block">
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block opacity-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: time + index * 0.1,
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.span>
  );
};

export const HeroLandingPage = () => {

  return (
    <div className="mb-8 w-[80%] h-[80vh]  flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center">
        <Image 
          src="/logo.svg" 
          alt="logo" 
          width={600} 
          height={48} 
          className="w-3/4 md:w-1/2 max-w-full max-h-full object-contain"
        />

        <h1 className="text-blue-950 dark:text-white text-base md:text-xl lg:text-2xl font-bold mt-8 w-[100%]">
            <AnimatedText time ={0.2} text={
              <>
                Tired of juggling tasks, deadlines, and team coordination? Meet the next-generation project 
                <span className="text-blue-500"> SkillSync</span>
              </>
            }/>
            <AnimatedText time ={0.3} text={"management platform that combines the power of AI with intuitive task tracking—so you can focus on "}/>
            <AnimatedText time ={0.4} text={"what truly matters."} />
            <motion.span
            className="inline-block ml-2 w-[180px]"
            initial={{ opacity: 0, y: 20 }} // Start faded out and slightly lower
            animate={{ opacity: 1, y: 0 }} // Fade in and move to position
            transition={{ duration: 0.6, ease: "easeOut" }} // Smooth transition
            >
                <RotatingText
                    texts={["Task Allocation", "Task Generation", "Code Initial Generation"]}
                    mainClassName="w-fit px-1 sm:px-1 md:px-2 bg-blue-400 text-white overflow-hidden py-0 sm:py-0.5 md:py-1 justify-center rounded-md text-sm"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                />
            </motion.span> 
        </h1>

        <Button className="group mt-8 relative inline-flex h-12 w-40 overflow-hidden rounded-lg p-[3px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-4 focus:ring-offset-slate-50 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_6px_-5px_rgba(0,0,0,0.4)]">
          <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center rounded-lg justify-center gap-2 bg-blue-950 px-6 py-2 text-lg font-medium text-white backdrop-blur-3xl hover:bg-slate-800 transition-colors duration-300">
            <Link href="/workspaces/create" className="flex items-center gap-2">
              Join Now
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </span>
        </Button>

      </div>
    </div>
  );

};