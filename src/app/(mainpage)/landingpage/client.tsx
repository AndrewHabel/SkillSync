"use client"
import { FooterAuroraGradient } from "@/components/fotter";
import { HeroLandingPage } from "@/components/hero-landing-page";
import { LandingNav } from "@/components/landing-nav";
import { StarryBackground } from "@/components/starry-background";
import { WhyChooseUs } from "@/components/why-choose-us-landing";
import { Models } from "node-appwrite";

interface LandingPageClientProps {
  user: Models.User<any> | null;
}

export const LandingPageClient = ({ user }: LandingPageClientProps) => {
    return (
      <div className="landing-page w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <StarryBackground 
          starCount={200}
          minSize={0.5}
          maxSize={3}
          minSpeed={0.05}
          maxSpeed={0.3}
        />
        <LandingNav user={user}/>
        <HeroLandingPage />
        <WhyChooseUs />
        
      </div>
    
    )
};