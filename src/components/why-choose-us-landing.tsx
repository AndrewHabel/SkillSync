import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RotatingText } from "./rotating-text";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import React, { useRef, useEffect, useState } from "react";
import { FaBrain } from "react-icons/fa";
import { MdAnalytics } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";

// Animation variants for different elements
const titleVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut", delay }
  })
};

const featureVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay } // Reduced from 0.7 to 0.5
  })
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.3, // Reduced from 0.5 to 0.3
      ease: "easeOut", 
      delay,
      type: "spring",
      stiffness: 300 // Increased from 200 to 300 for faster spring motion
    }
  })
};

export const WhyChooseUs = () => {
  const componentRef = useRef(null);
  const isInView = useInView(componentRef, { once: true, amount: 0.2 });
  
  // References for line animations
  const horizontalLine1Ref = useRef(null);
  const verticalLineRef = useRef(null);
  const horizontalLine2Ref = useRef(null);
  
  const horizontalLine1InView = useInView(horizontalLine1Ref, { once: true, amount: 0.5 });
  const verticalLineInView = useInView(verticalLineRef, { once: true, amount: 0.5 });
  const horizontalLine2InView = useInView(horizontalLine2Ref, { once: true, amount: 0.5 });
  
  // Handle window object safely with useState and useEffect for SSR
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={componentRef}
      className="why-choose-us-section landing-page-card z-10 mb-10 rounded-lg w-[100%] h-[100%] flex flex-col lg:flex-row overflow-hidden shadow-[inset_0_4px_15px_rgba(0,0,0,0.3)]"
    >
      <motion.div 
        className="p-9 flex flex-col"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {}
        }}
      >
        <motion.h2 
          className="feature-title text-xl md:text-1xl lg:text-2xl mb-4"
          variants={titleVariants}
          custom={0.1}
        >
          <span className="blue-text">/</span> Why SkillSync? 
        </motion.h2>
        <motion.h1 
          className="feature-title text-4xl md:text-3xl lg:text-8xl font-bold mb-4"
          variants={titleVariants}
          custom={0.3}
        >
          The <span className="blue-text">SkillSync</span>
        </motion.h1>
        <motion.h1 
          className="feature-title text-4xl md:text-3xl lg:text-8xl font-bold mb-4"
          variants={titleVariants}
          custom={0.5}
        >
          Difference
        </motion.h1>
        <motion.p 
          className="feature-description"
          variants={titleVariants}
          custom={0.7}
        >
          Managing projects shouldn't feel like a chore. With AI-powered automation, we take the hassle out of planning, tracking, and executing tasks so you can focus on what matters most.
        </motion.p>
        <motion.div 
          className="mt-8 flex flex-row flex-wrap gap-4 md:gap-6 lg:gap-8"
          variants={titleVariants}
          custom={0.9}
        >
          <button className="text-blue-500 group relative inline-flex h-12 w-[160px] overflow-hidden rounded-lg p-[3px] bg-transparent">
            <Link href="/sign-in" className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg landing-page-text-primary bg-transparent">
              Start Creating
              <ArrowRight className="landing-page-icon w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </button>

          <button className="text-blue-500 group relative inline-flex h-12 w-[160px] overflow-hidden rounded-lg p-[3px] bg-transparent">
            <Link href="/sign-in" className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg landing-page-text-primary bg-transparent">
              Learn more
              <ArrowRight className="landing-page-icon w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </button>
        </motion.div>
      </motion.div>
      
      <div className="lg:mt-36 lg:mb-24 md:mt-20 md:mb-20 mt-10 mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-rows-1 md:grid-rows-2 gap-11 position: relative">
          <motion.div
            className="flex flex-col items-center justify-center"
            variants={featureVariants}
            custom={0.1} 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }} 
          >
            <motion.div
              className="flex flex-row gap-3 justify-center items-center"
            >
              <motion.div
                variants={iconVariants}
                custom={0.15} 
              >
                <FaBrain className="feature-icon text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              </motion.div>
              <h1 className="feature-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                AI Features
              </h1>
            </motion.div>
            <motion.p
              className="feature-description w-[70%] md:w-[80%] lg:w-[80%] text-center"
              variants={featureVariants}
              custom={0.2} 
            >
              Our AI tool enhances project management with smart task allocation,
              automated task creation, and AI-driven code suggestions. It assigns
              tasks efficiently, converts user stories into actionable steps, and
              accelerates development with initial code generation—boosting
              productivity effortlessly.
            </motion.p>
          </motion.div>

          <motion.div 
            ref={horizontalLine1Ref}
            className="absolute blue-bg h-1 w-3/4 bottom-[49%] left-[10%] lg:bottom-[49%] lg:left-[10%] md:bottom-[49%] md:left-[10%]"
            initial={{ width: 0 }}
            animate={horizontalLine1InView ? { width: "75%" } : { width: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
          ></motion.div>

          <motion.div 
            ref={verticalLineRef}
            className="absolute blue-bg h-1 w-3/4 md:w-2 md:h-full lg:w-2 lg:h-full left-[10%] bottom-[-48%] md:bottom-[0%] lg:bottom-[0%] lg:left-[100%] md:left-[100%]"
            initial={{ 
              height: "1px", 
              width: isMobile ? "75%" : "2px"
            }}
            animate={verticalLineInView ? { 
              height: isMobile ? "1px" : "100%",
              width: isMobile ? "75%" : "4px"
            } : { 
              height: "1px", 
              width: isMobile ? "0%" : "4px"
            }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.8 }}
          ></motion.div>

          <motion.div 
            ref={horizontalLine2Ref}
            className="absolute blue-bg h-1 w-3/4 left-[10%] bottom-[-3%] lg:bottom-[41%] lg:left-[115%] md:bottom-[41%] md:left-[115%]"
            initial={{ width: 0 }}
            animate={horizontalLine2InView ? { width: "75%" } : { width: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 1.2 }}
          ></motion.div>

          <motion.div
            className="flex flex-col items-center justify-center"
            variants={featureVariants}
            custom={0.3} // Reduced from 0.6
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }} // Reduced from 0.6
          >
            <motion.div
              className="flex flex-row gap-3 justify-center items-center"
            >
              <motion.div
                variants={iconVariants}
                custom={0.35} // Reduced from 0.7
              >
                <MdAnalytics className="feature-icon text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              </motion.div>
              <h1 className="feature-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                statistics & <br /> analytics
              </h1>
            </motion.div>
            <motion.p
              className="feature-description w-[70%] md:w-[80%] lg:w-[80%] text-center"
              variants={featureVariants}
              custom={0.4} // Reduced from 0.8
            >
              Stay in control of your projects with real-time statistics and analytics
              that give you a complete overview of your workspace activity, task
              progress, and team performance. Our interactive dashboards provide
              real-time updates, charts, and trends to help you make informed
              decisions effortlessly.
            </motion.p>
          </motion.div>
        </div>
        
        <div className="lg:mt-24 md:mt-24 grid grid-rows-1 md:grid-rows-2 gap-11">
          <motion.div
            className="flex flex-col items-center justify-center"
            variants={featureVariants}
            custom={0.5} // Reduced from 1.0
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }} // Reduced from 0.6
          >
            <motion.div
              className="flex flex-row gap-3 justify-center items-center"
            >
              <motion.div
                variants={iconVariants}
                custom={0.55} // Reduced from 1.1
              >
                <MdAttachMoney className="feature-icon text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              </motion.div>
              <h1 className="feature-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                competitive <br /> pricing
              </h1>
            </motion.div>
            <motion.p
              className="feature-description w-[70%] md:w-[80%] lg:w-[80%]"
              variants={featureVariants}
              custom={0.6} // Reduced from 1.2
            >
              Get the best value for your project management needs with our flexible
              pricing plans. Whether you're a small team or a large enterprise, we
              have a plan that fits your budget—without compromising on features.
            </motion.p>
          </motion.div>   

          <motion.div
            className="flex flex-col items-center justify-center"
            variants={featureVariants}
            custom={0.7} // Reduced from 1.4
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }} // Reduced from 0.6
          >
            <motion.div
              className="flex flex-row gap-3 justify-center items-center"
            >
              <motion.div
                variants={iconVariants}
                custom={0.75} // Reduced from 1.5
              >
                <FaUsers className="feature-icon text-3xl md:text-4xl lg:text-8xl font-bold mb-4" />
              </motion.div>
              <h1 className="feature-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                User <br /> satisfaction
              </h1>
            </motion.div>
            <motion.p
              className="feature-description w-[70%] md:w-[80%] lg:w-[80%]"
              variants={featureVariants}
              custom={0.8} // Reduced from 1.6
            >
              With a 95%+ customer satisfaction rating, 99.9% uptime, and 24/7
              support, we empower businesses of all sizes to boost productivity,
              streamline workflows, and achieve goals efficiently.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
