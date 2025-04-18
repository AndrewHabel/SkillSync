import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { ProjectIdClient } from "./client";


const ProjectIdPage = async () => {
  const user = await getCurrent();
  if(!user) redirect("http://localhost:3000/landingpage");


  return <ProjectIdClient />
};

export default ProjectIdPage;