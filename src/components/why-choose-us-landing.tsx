import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RotatingText } from "./rotating-text";
import { motion } from "framer-motion";
import React from "react";
import { FaBrain } from "react-icons/fa";

export const WhyChooseUs = () => {

  return (
    <div className="bg-white z-10 mb-10 rounded-lg w-[100%] h-[100%] flex flex-col lg:flex-row overflow-hidden shadow-[inset_0_4px_15px_rgba(0,0,0,0.3)]">

      <div className="p-9 flex flex-col">
        <h2 className="text-blue-950 text-xl md:text-1xl lg:text-2xl mb-4">
          <span className="text-blue-500">/</span> Why SkillSync? 
        </h2>
        <h1 className="text-blue-950 text-4xl md:text-3xl lg:text-8xl font-bold mb-4">The <span className="text-blue-500">SkillSync</span></h1>
        <h1  className="text-blue-950 text-4xl md:text-3xl lg:text-8xl font-bold mb-4">Difference</h1>
        <p>Managing projects shouldn't feel like a chore. With AI-powered automation, <br/> we take the hassle out of planning, tracking, and executing tasks <br/> so you can focus on what matters most.</p>
        <div className="mt-8 flex flex-row gap-24">

        <button className="text-blue-500 group  relative inline-flex h-12 w-40 overflow-hidden rounded-lg p-[3px] bg-transparent">
          <Link href="/sign-in" className="flex items-center gap-2 text-inherit bg-transparent">
            Learn more
            <ArrowRight className="w-5 h-5 text-blue-950 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </button>
        <button className="text-blue-500 group relative inline-flex h-12 w-40 overflow-hidden rounded-lg p-[3px] bg-transparent">
          <Link href="/sign-in" className="flex items-center gap-2 text-inherit bg-transparent">
            Start Creating
            <ArrowRight className="w-5 h-5 text-blue-950 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </button>
        </div>
      </div>
      
      <div className="lg:py-52 md:py-24 sm:py-20 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">

        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row gap-3 justify-center items-center">
            <FaBrain className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
            <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">AI Features</h1>
          </div>
          <p className="w-[70%] md:w-[80%] lg:w-[80%]">
            Our AI tool enhances project management with smart task allocation, automated task creation, and AI-driven code suggestions. It assigns tasks efficiently, converts user stories into actionable steps, and accelerates development with initial code generation—boosting productivity effortlessly.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row gap-3 justify-center items-center">
            <FaBrain className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
            <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">AI Features</h1>
          </div>
          <p className="w-[70%] md:w-[80%] lg:w-[80%]">
            Our AI tool enhances project management with smart task allocation, automated task creation, and AI-driven code suggestions. It assigns tasks efficiently, converts user stories into actionable steps, and accelerates development with initial code generation—boosting productivity effortlessly.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row gap-3 justify-center items-center">
            <FaBrain className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
            <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">AI Features</h1>
          </div>
          <p className="w-[70%] md:w-[80%] lg:w-[80%]">
            Our AI tool enhances project management with smart task allocation, automated task creation, and AI-driven code suggestions. It assigns tasks efficiently, converts user stories into actionable steps, and accelerates development with initial code generation—boosting productivity effortlessly.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row gap-3 justify-center items-center">
            <FaBrain className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
            <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">AI Features</h1>
          </div>
          <p className="w-[70%] md:w-[80%] lg:w-[80%]">
            Our AI tool enhances project management with smart task allocation, automated task creation, and AI-driven code suggestions. It assigns tasks efficiently, converts user stories into actionable steps, and accelerates development with initial code generation—boosting productivity effortlessly.
          </p>
        </div>

      </div>

    </div>
  );
};

