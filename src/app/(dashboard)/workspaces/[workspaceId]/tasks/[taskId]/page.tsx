import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { TaskIdClient } from "./client";

const TaskIdPage = async () => {

    const user = await getCurrent();
    if(!user) redirect("http://localhost:3000/landingpage");

    return(
        <TaskIdClient />
    );
};

export default TaskIdPage;