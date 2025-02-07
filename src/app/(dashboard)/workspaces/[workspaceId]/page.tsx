import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { WorkSpaceIdClient } from "./client";

const WorkspacedPageId = async () => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in")

    return (
        <WorkSpaceIdClient />
    )
     
}

export default WorkspacedPageId;