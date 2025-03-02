import { getCurrent } from "@/features/auth/queries";

import { redirect } from "next/navigation";
import { WorkspaceIdJoinClient } from "./client";


const WorkspaceIdJoinPage = async ()  => {
    const user = await getCurrent();
    if(!user) redirect("http://localhost:3000/landingpage");

    return <WorkspaceIdJoinClient />;
}

export default WorkspaceIdJoinPage;