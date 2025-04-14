"use client"
import { BackgroundBeams } from "@/components/background-beams";
import { FooterAuroraGradient } from "@/components/fotter";
import { HeroLandingPage } from "@/components/hero-landing-page";
import { LandingNav } from "@/components/landing-nav";
import { WhyChooseUs } from "@/components/why-choose-us-landing";
import { Models } from "node-appwrite";

interface LandingPageClientProps {
  user: Models.User<any> | null;
}

export const LandingPageClient = ({ user }: LandingPageClientProps) => {
    return (
      <div className="landing-page w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/*<BackgroundBeams
        starCount={1000}
        starColor={[255, 255, 255]}
        speedFactor={0.05}
        backgroundColor="wh"
        />
        */}
        <LandingNav user={user}/>
        <HeroLandingPage />
        <WhyChooseUs />
        
      </div>
    
    )
};