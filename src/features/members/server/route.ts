import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember} from "../utils";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { get } from "http";
import { Member, MemberRole } from "../types";
import { UpdateMemberSchema } from "../schema";
import { TaskStatus } from "@/features/tasks/types";

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
            const { role ,name , image} = c.req.valid("form");
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

            if(uploadedImageUrl){
                await databases.updateDocument(
                    DATABASE_ID,
                    MEMBERS_ID,
                    memberId,
                    {
                        role,
                        imageUrl: uploadedImageUrl,
                    }
                )
            }
        
            return c.json({data:{$id:memberToUpdate.$id}});

       }
    )
    .get(
        "/:memberId/workload",
        sessionMiddleware,
        zValidator("query", z.object({ 
            workspaceId: z.string(),
            projectId: z.string().optional()
        })),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId, projectId } = c.req.valid("query");
            const { memberId } = c.req.param();

            console.log("MemberId", memberId);
            console.log("WorkspaceId", workspaceId);
            console.log("ProjectId", projectId);

            // Check if the target member exists in this workspace
            const targetMember = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId
            );

            if (!targetMember || targetMember.workspaceId !== workspaceId) {
                return c.json({ error: "Member not found in this workspace" }, 404);
            }

            // Prepare query conditions for tasks
            const conditions = [
                Query.equal("workspaceId", workspaceId),
                Query.equal("assigneeId", memberId),
            ];
            
            // Add projectId filter if provided
            if (projectId) {
                conditions.push(Query.equal("projectId", projectId));
            }

            // Get all tasks assigned to this member
            const tasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                conditions
            );

            console.log("Tasks", tasks);

            // Calculate the total estimated hours
            let totalHours = 0;
            let todoHours = 0;
            let inProgressHours = 0;
            let inReviewHours = 0;
            let backlogHours = 0;
            let doneHours = 0;

            tasks.documents.forEach(task => {
                const hours = task.estimatedHours || 0;
                totalHours += hours;

                // Calculate hours by status
                switch (task.status) {
                    case TaskStatus.BACKLOG:
                        backlogHours += hours;
                        break;
                    case TaskStatus.TODO:
                        todoHours += hours;
                        break;
                    case TaskStatus.IN_PROGRESS:
                        inProgressHours += hours;
                        break;
                    case TaskStatus.IN_REVIEW:
                        inReviewHours += hours;
                        break;
                    case TaskStatus.DONE:
                        doneHours += hours;
                        break;
                }
            });

            return c.json({
                data: {
                    memberId,
                    totalHours,
                    activeHours: totalHours - doneHours,
                    taskCount: tasks.total,
                    byStatus: {
                        backlog: backlogHours,
                        todo: todoHours,
                        inProgress: inProgressHours,
                        inReview: inReviewHours,
                        done: doneHours
                    }
                }
            });
        }
    )

export default app;

