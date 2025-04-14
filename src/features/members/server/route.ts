import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember} from "../utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { get } from "http";
import { Member, MemberRole } from "../types";
import { UpdateMemberSchema } from "../schema";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {

            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });
            

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const members =  await databases.listDocuments<Member>(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                ]
            )

            const populatedMembers = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    const username = user.email.split('@')[0];
                    return {
                        ...member,
                        name:user.name || username,
                        skills:member.skills || [],
                        image:member.imageUrl || null,
                        email:user.email,
                        role:member.role,
                    };
                })
            )

            return c.json({data:{...members , documents:populatedMembers}});

        }
    )
    .get(
        "/:memberId",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.valid("query");
            const { memberId } = c.req.param(); 
    
    
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const memberProfle =  await databases.listDocuments<Member>(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal("userId", memberId),
                    Query.equal("workspaceId", workspaceId),
                ]
            )
            
            return c.json({data:{
                id: memberProfle.documents[0].$id,
                name:user.name,
                email:user.email,
                role:memberProfle.documents[0].role,
                skills:memberProfle.documents[0].skills,
                image:memberProfle.documents[0].imageUrl,
            }});
        }
    )
    .delete(
        "/:memberId",
        sessionMiddleware,
        async (c) => {

            const {memberId} = c.req.param();
            const user = c.get("user");
            const databases = c.get("databases");

            const memberToDelete = await databases.getDocument(
                DATABASE_ID, 
                MEMBERS_ID, 
                memberId
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", memberToDelete.workspaceId),
                ]
            )

            const member = await getMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            if(member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN){
                return c.json({error:"Unauthorized"},401);
            }

            if(allMembersInWorkspace.documents.length === 1){
                return c.json({error:"Cannot delete the last member"},400);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            )

            return c.json({data:{$id:memberToDelete.$id}});

        }
    )
    .patch(
       "/:memberId",
       sessionMiddleware,
       zValidator("form", UpdateMemberSchema),
       async (c) => {

            const {memberId} = c.req.param();
            const { role ,name , skills , image} = c.req.valid("form");
            const user = c.get("user");
            const databases = c.get("databases");
            const { account } = await createSessionClient();
            const storage = c.get("storage");
            

            const memberToUpdate = await databases.getDocument(
                DATABASE_ID, 
                MEMBERS_ID, 
                memberId
            );

            
            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", memberToUpdate.workspaceId),
                ]
            )

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if(allMembersInWorkspace.documents.length === 1 && role === MemberRole.MEMBER){
                return c.json({error:"Cannot set the last member to member role"},400);
            }

            await account.updateName(name);

            let uploadedImageUrl: string | undefined;
            
            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                );
                        
                // getFileView returns an ArrayBuffer directly
                const arrayBuffer = await storage.getFileView(
                    IMAGES_BUCKET_ID,
                    file.$id
                );
                        
                const buffer = Buffer.from(arrayBuffer); // Convert to Node.js Buffer
                uploadedImageUrl = `data:${image.type};base64,${buffer.toString("base64")}`;
            }

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
                {
                    role,
                    skills,
                    imageUrl: uploadedImageUrl,
                }
            )

            return c.json({data:{$id:memberToUpdate.$id}});

       }
    )

export default app;

