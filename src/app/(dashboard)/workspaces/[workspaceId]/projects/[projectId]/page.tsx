import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getProject } from "@/features/projects/queries";

interface ProjectIdPageProps{
  params: { projectId: string };
};

const ProjectIdPage = async ({
  params,
}:ProjectIdPageProps) => {
  const user = await getCurrent();
  if(!user) redirect("/sign-in");


  const initialValues = await getProject({
    projectId: params.projectId,
  })

  return(
    <div>
      {JSON.stringify(initialValues)}
    </div>
  );
};

export default ProjectIdPage;