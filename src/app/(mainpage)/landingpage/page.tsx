"use client"
import { BackgroundBeams } from "@/components/background-beams";
import { FooterAuroraGradient } from "@/components/fotter";
import { HeroLandingPage } from "@/components/hero-landing-page";
import { WhyChooseUs } from "@/components/why-choose-us-landing";

const landingPage =  async () => {
    return (
      <div className="bg-transparent flex flex-col items-center justify-center w-full h-full overflow-hidden ">
        <BackgroundBeams
        starCount={3000}
        starColor={[255, 255, 255]}
        speedFactor={0.05}
        backgroundColor="black"
        />
        <HeroLandingPage />
        <WhyChooseUs />
      </div>
    
    )
};

export default landingPage;