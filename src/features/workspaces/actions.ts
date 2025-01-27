"use server"

import { cookies } from "next/headers";
import { Account, Client, Databases, Query } from "node-appwrite";
import { AUTH_COOKIE } from "../auth/constans";
import { DATABASE_ID, Members_ID, WORKSPACES_ID } from "@/config";

export const getWorkspaces = async () => {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) 
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!); 

    const session = await cookies().get(AUTH_COOKIE);

    if(!session) return {documents: [],total:0};

    client.setSession(session.value);
    const databases = new Databases(client);
    const account = new Account(client);
    const user = await account.get();
    
    const members = await databases.listDocuments(
      DATABASE_ID,
      Members_ID,
      [Query.equal("userId", user.$id)]
  )

  if(!members.documents.length){
      return {documents: [],total:0};
  }

  const workspaceIds = members.documents.map((member) => member.workspaceId);

  const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [
          Query.orderDesc("$createdAt"),
          Query.contains("$id", workspaceIds)
      ],
  );
  
  return workspaces;

  } catch {
    return {documents: [],total:0};
  }
  

}