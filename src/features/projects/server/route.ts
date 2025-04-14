import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from '@/config';
import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import {Hono} from 'hono';
import { ID, Query } from 'node-appwrite';
import { z } from 'zod';
import { createProjectSchema, UpdateProjectSchema } from '../schema';
import { Project } from '../types';
import { error } from 'console';
import { endOfMonth , startOfMonth , subMonths} from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';
const app = new Hono()
    .post(
        "/",
        sessionMiddleware,
        zValidator("form" , createProjectSchema),

        async (c) => {

            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { name, image , workspaceId , ProjectTechStack} = c.req.valid("form");

            console.log(ProjectTechStack);

            const member = await getMember({
                databases,
                workspaceId,
                userId : user.$id
            });

            if(!member){
                return c.json({error: "Unauthorized"}, 401)
            }

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
            
            const project = await databases.createDocument(
                DATABASE_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    name,
                    imageUrl: uploadedImageUrl,
                    workspaceId,
                    ProjectTechStack,
                },
            );
 
            return c.json({data:project});
        }

    )
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c)=>{
            const user = c.get("user");
            const databases =  c.get("databases");
            const {workspaceId} = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId : user.$id
            });

            if(!member){
                return c.json({error: "Unauthorized"}, 401);
            }


            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt")
                ]
            );


            return c.json({data:projects});
        }
    )
    .patch(
            "/:projectId",
            sessionMiddleware,
            zValidator("form", UpdateProjectSchema),
            async (c) => {
                const databases = c.get("databases");
                const storage = c.get("storage");
                const user = c.get("user");
    
                const { projectId } = c.req.param();
                const { name, image } = c.req.valid("form");

                const existingProject = await databases.getDocument<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId,
                );
    
                const members = await getMember({
                    databases,
                    workspaceId: existingProject.workspaceId,
                    userId: user.$id,
                });
    
                if (!members) {
                    return c.json({error: "Unauthorized"},401);
                }
    
                let uploadedImageUrl: string | undefined;
    
                if(image instanceof File){
                    const file = await storage.createFile(
                        IMAGES_BUCKET_ID,
                        ID.unique(),
                        image,
                    );
    
                    const arrayBuffer = await storage.getFilePreview(
                        IMAGES_BUCKET_ID,
                        file.$id,
                    );
    
                    uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
                } else{
                    uploadedImageUrl = image;
                }
    
                const project = await databases.updateDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId,
                    {
                        name,
                        imageUrl: uploadedImageUrl,
                    }
                )
                return c.json({data:project});
            }
        )
    .delete(
            "/:projectId",
            sessionMiddleware,
            async (c) => {
    
                const databases = c.get("databases");
                const user = c.get("user");
    
                const { projectId } = c.req.param();

                const existingProject = await databases.getDocument<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId,
                );
    
                const member = await getMember({
                    databases,
                    workspaceId: existingProject.workspaceId,
                    userId: user.$id,
                }); 
    
                if(!member){
                    return c.json({error: "Unauthorized"},401);
                }
    
                await databases.deleteDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId,
                );
    
                return c.json({data: {$id : existingProject.$id}});
    
            }
        )
    .get(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            );

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id,
            });

            if(!member){
                return c.json({error: "Unauthorized"}, 401);
            }

            return c.json({data: project});
        }
    )
    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            );

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id,
            });

            if(!member){
                return c.json({error: "Unauthorized"}, 401);
            }

            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));

            const thisMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThan("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThan("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;

            const thisMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThan("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThan("$createdAt", lastMonthEnd.toISOString()),
                ]
            );

            const assignedTaskCount = thisMonthAssignedTasks.total;
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

            const thisMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThan("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThan("$createdAt", lastMonthEnd.toISOString()),
                ]
            );


            const incompleteTaskCount = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;

            const thisMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThan("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThan("$createdAt", lastMonthEnd.toISOString()),
                ]
            );


            const completedTaskCount = thisMonthCompletedTasks.total;
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;

            const thisMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThan("dueDate", now.toISOString()),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThan("$createdAt", thisMonthEnd.toISOString()),
                ]
            );

            const lastMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThan("dueDate", now.toISOString()),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThan("$createdAt", lastMonthEnd.toISOString()),
                ]
            );


            const OverdueTaskCount = thisMonthOverdueTasks.total;
            const OverdueTaskDifference = OverdueTaskCount - lastMonthOverdueTasks.total;

            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assignedTaskCount,
                    assignedTaskDifference,
                    incompleteTaskCount,
                    incompleteTaskDifference,
                    completedTaskCount,
                    completedTaskDifference,
                    OverdueTaskCount,
                    OverdueTaskDifference,
                }
            })
        })
export default app;