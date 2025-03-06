import { BackgroundBeams } from "@/components/background-beams";
import { FooterAuroraGradient } from "@/components/fotter";
import { HeroLandingPage } from "@/components/hero-landing-page";
import { WhyChooseUs } from "@/components/why-choose-us-landing";
import {LandingPageClient} from "./client";
import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";

const landingPage = async () => {

    const user = await getCurrent();

    return (
      <LandingPageClient user={user}/>
    )
};

export default landingPage;