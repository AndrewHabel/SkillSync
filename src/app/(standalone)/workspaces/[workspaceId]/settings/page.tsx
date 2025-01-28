import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspaces-form";
import { Edit } from "lucide-react";
import { redirect } from "next/navigation";

interface WorkspaceIdSettingsPageProps {
    params:{
        workspaceId:string;
    }
}

const  WorkspaceIdSettingsPage = async ({params}:WorkspaceIdSettingsPageProps) => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in")
    const initailvalues = await getWorkspace({workspaceId:params.workspaceId});
    if(!initailvalues) redirect(`/workspaces/${params.workspaceId}`);

    return (
        <div className="w-full lg:max-2-xl">
        <EditWorkspaceForm initialValues={initailvalues}/>
        </div>
    );
}

export default WorkspaceIdSettingsPage;