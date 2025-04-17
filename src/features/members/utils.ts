import {Query , type Databases} from "node-appwrite";
import {DATABASE_ID , MEMBERS_ID} from "@/config";

interface GetMembersProps {
    databases: Databases;
    workspaceId: string;
    userId: string;
}

interface GetMembersProfileProps {
    databases: Databases;
    userId: string;
}

export const getMember = async ({
    databases,
    workspaceId,
    userId,
}:GetMembersProps) => {
    const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [
            Query.equal("workspaceId", workspaceId),
            Query.equal("userId", userId),
        ]
    );

    console.log("argaebebab",userId)
    console.log("gargeargaergaerg",workspaceId)

    return members.documents[0];
};