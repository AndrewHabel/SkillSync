import { getCurrent } from "@/features/auth/queries";
import { UserButton } from "@/features/auth/components/user-button";
import { getWorkspaces } from "@/features/workspaces/queries";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspaces-form";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in")

  const workspaces = await getWorkspaces();

  if (workspaces.total === 0) {
    redirect("/workspaces/create");
  }else{
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
  }
};