import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { UserStoryIdClient } from "./client";

const UserStoryIdPage = async () => {
    const user = await getCurrent();
    if(!user) redirect("http://localhost:3000/landingpage");

    return (
        <UserStoryIdClient />
    );
};

export default UserStoryIdPage;