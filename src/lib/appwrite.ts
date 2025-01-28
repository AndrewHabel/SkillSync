/* eslint-disable @typescript-eslint/no-unused-vars */
import "server-only";
import {
    Client,
    Account,
    Databases,
    Storage,
    Users,
} from "node-appwrite"
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/features/auth/constans";

export async function createSessionClient(){
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

    const session = await cookies().get(AUTH_COOKIE);

    if(!session||!session.value) {
        throw new Error("Unauthorized");
    }

    client.setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        }
    };
};

export async function createAdminClient(){
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.NEXT_APPWRITE_KEY!)
    return {
        getAccount() {
            return new Account(client);
        },
    };
};