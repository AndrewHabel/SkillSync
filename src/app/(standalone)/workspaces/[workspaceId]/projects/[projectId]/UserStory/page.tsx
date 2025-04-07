import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdStoriesClient } from "./client";

const ProjectIdStoriesPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("http://localhost:3000/landingpage")

  return(
    <ProjectIdStoriesClient />
  );
}

export default ProjectIdStoriesPage;