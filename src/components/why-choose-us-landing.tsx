import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RotatingText } from "./rotating-text";
import { motion } from "framer-motion";
import React from "react";
import { FaBrain } from "react-icons/fa";
import { MdAnalytics } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";


export const WhyChooseUs = () => {

  return (

    <div className="bg-white z-10 mb-10 rounded-lg w-[100%] h-[100%] flex flex-col lg:flex-row overflow-hidden shadow-[inset_0_4px_15px_rgba(0,0,0,0.3)]">

      <div className="p-9 flex flex-col">
        <h2 className="text-blue-950 text-xl md:text-1xl lg:text-2xl mb-4">
          <span className="text-blue-500">/</span> Why SkillSync? 
        </h2>
        <h1 className="text-blue-950 text-4xl md:text-3xl lg:text-8xl font-bold mb-4">The <span className="text-blue-500">SkillSync</span></h1>
        <h1  className="text-blue-950 text-4xl md:text-3xl lg:text-8xl font-bold mb-4">Difference</h1>
        <p className="text-blue-950">Managing projects shouldn't feel like a chore. With AI-powered automation, we take the hassle out of planning, tracking, and executing tasks so you can focus on what matters most.</p>
        <div className="mt-8 flex flex-row gap-24">

          <button className="text-blue-500 group relative inline-flex h-12 w-40 overflow-hidden rounded-lg p-[3px] bg-transparent">
            <Link href="/sign-in" className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg text-inherit bg-transparent">
              Start Creating
              <ArrowRight className="w-5 h-5 text-blue-950 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </button>

          <button className="text-blue-500 group relative inline-flex h-12 w-40 overflow-hidden rounded-lg p-[3px] bg-transparent">
            <Link href="/sign-in" className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg text-inherit bg-transparent">
              Learn more
              <ArrowRight className="w-5 h-5 text-blue-950 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </button>

        </div>
      </div>
      
      <div className=" lg:mt-36 lg:mb-24 md:mt-20 md:mb-20 mt-10 mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="grid grid-rows-1 md:grid-rows-2 gap-11 position: relative">

          <div className="flex flex-col items-center justify-center ">
            <div className="flex flex-row gap-3 justify-center items-center">
              <FaBrain  className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">AI Features</h1>
            </div>
            <p className="text-blue-950 w-[70%] md:w-[80%] lg:w-[80%]">
            Our AI tool enhances project management with smart task allocation, automated task creation, and AI-driven code suggestions. It assigns tasks efficiently, converts user stories into actionable steps, and accelerates development with initial code generation—boosting productivity effortlessly.
            </p>
          </div>

          <div className="absolute bg-blue-400 h-1 w-3/4 bottom-[49%] left-[10%] lg:bottom-[49%] lg:left-[10%] md:bottom-[49%] md:left-[10%]"></div>

          <div className="absolute bg-blue-400 h-1 w-3/4 lg:w-1 lg:h-full left-[10%] bottom-[-48%] md:bottom-[0%] lg:bottom-[0%] lg:left-[100%] md:left-[100%]"></div>

          <div className="absolute bg-blue-400 h-1 w-3/4 left-[10%] bottom-[-3%] lg:bottom-[41%] lg:left-[115%] md:bottom-[41%] md:left-[115%]"></div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row gap-3 justify-center items-center">
              <MdAnalytics  className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">statistics & <br/> analytics </h1>
            </div>
            <p className="text-blue-950 w-[70%] md:w-[80%] lg:w-[80%]">
              Stay in control of your projects with real-time statistics and analytics that give you a complete overview of your workspace activity, task progress, and team performance Our interactive dashboards provide real-time updates, charts, and trends to help you make informed decisions effortlessly.
            </p>
          </div>

        </div>
        
        <div className="lg:mt-24 md:mt-24 grid grid-rows-1 md:grid-rows-2 gap-11">

          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row gap-3 justify-center items-center">
              <MdAttachMoney  className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">competitive <br/> pricing</h1>
            </div>
            <p className="text-blue-950 w-[70%] md:w-[80%] lg:w-[80%]">
              Get the best value for your project management needs with our flexible pricing plans. Whether you're a small team or a large enterprise, we have a plan that fits your budget—without compromising on features.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row gap-3 justify-center items-center">
              <FaUsers className="text-blue-950 text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              <h1 className="text-blue-950 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">User <br/> satisfaction </h1>
            </div>
            <p className="text-blue-950 w-[70%] md:w-[80%] lg:w-[80%]">
              With a 95%+ customer satisfaction rating, 99.9% uptime, and 24/7 support, we empower businesses of all sizes to boost productivity, streamline workflows, and achieve goals efficiently.
            </p>
          </div>
          
        </div>

      </div>

    </div>

  );
};
