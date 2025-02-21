"use client"
import { HeroLandingPage } from "@/components/hero-landing-page";
import { BackgroundBeams } from "@/components/ui/background-beams";

const landingPage =  async () => {
    return (
      <div className="flex flex-col items-center justify-center w-screen overflow-hidden">
        <BackgroundBeams />
        <HeroLandingPage />
      </div>
    
    )
};

export default landingPage;