/* eslint-disable @typescript-eslint/no-unused-vars */
import "server-only";
import {
    Client,
    Account,
    Databases,
    Storage,
    Users,
} from "node-appwrite"

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