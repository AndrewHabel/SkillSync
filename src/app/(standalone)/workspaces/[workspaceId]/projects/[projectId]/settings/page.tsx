import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./client";

const ProjectIdSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("http://localhost:3000/landingpage")

  return(
    <ProjectIdSettingsClient />
  );
}

export default ProjectIdSettingsPage;