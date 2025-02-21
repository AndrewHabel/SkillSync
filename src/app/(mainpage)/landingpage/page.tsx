"use client"
import { BackgroundBeams } from "@/components/background-beams";
import { HeroLandingPage } from "@/components/hero-landing-page";
import { WhyChooseUs } from "@/components/why-choose-us-landing";

const landingPage =  async () => {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-full overflow-hidden ">
        <BackgroundBeams/>
        <HeroLandingPage />
        <WhyChooseUs />
      </div>
    
    )
};

export default landingPage;