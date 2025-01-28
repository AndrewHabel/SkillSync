import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";

const WorkspacedPageId = async () => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in")

    return (
        <div>
        <h1>Workspace Id</h1>
        </div>
    );
     
}

export default WorkspacedPageId;