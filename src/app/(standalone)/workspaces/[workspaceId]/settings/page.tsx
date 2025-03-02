import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdSettingsClient } from "./client";



const  WorkspaceIdSettingsPage = async () => {

    const user = await getCurrent();
    if (!user) redirect("http://localhost:3000/landingpage")

    return (
        <WorkspaceIdSettingsClient />
    );
}

export default WorkspaceIdSettingsPage;