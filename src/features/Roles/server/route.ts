import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { DATABASE_ID, MEMBERS_ID, Roles_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { createRoleSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string().min(1),
        })),
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const { workspaceId } = c.req.valid("query");

                // Verify user is a member of the workspace
                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id,
                });

                if (!member) {
                    return c.json({ error: "Member not found" }, 404);
                }

                // Fetch all roles for the workspace
                const roles = await databases.listDocuments(
                    DATABASE_ID,
                    Roles_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                    ]
                );

                return c.json({ data: roles.documents }, 200);
            } catch (error: any) {
                console.error("Error fetching roles:", error);
                return c.json({ error: error.message || "Failed to fetch roles" }, 500);
            }
        }
    )
    .get(
        "/:roleId",
        sessionMiddleware,
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const roleId = c.req.param("roleId");

                if (!roleId) {
                    return c.json({ error: "Role ID is required" }, 400);
                }

                // Fetch the role
                const role = await databases.getDocument(
                    DATABASE_ID,
                    Roles_ID,
                    roleId
                );

                if (!role) {
                    return c.json({ error: "Role not found" }, 404);
                }

                // Verify user is a member of the workspace
                const member = await getMember({
                    databases,
                    workspaceId: role.workspaceId,
                    userId: user.$id,
                });

                if (!member) {
                    return c.json({ error: "Member not found" }, 404);
                }

                return c.json({ data: role }, 200);
            } catch (error: any) {
                console.error("Error fetching role:", error);
                return c.json({ error: error.message || "Failed to fetch role" }, 500);
            }
        }
    )
    .post(
        "/create",
        sessionMiddleware,
        zValidator("json", createRoleSchema),
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                const { 
                    workspaceId, 
                    roleName, 
                    manageProjects, 
                    manageTeams, 
                    manageUserStories, 
                    manageTasks, 
                    manageAnalytics 
                } = c.req.valid("json");

                // Verify user is an admin of the workspace
                const member = await getMember({
                    databases,
                    workspaceId,
                    userId: user.$id,
                });

                if (!member) {
                    return c.json({ error: "Member not found" }, 404);
                }

                if (member.role !== MemberRole.ADMIN) {
                    return c.json({ error: "Only workspace administrators can create roles" }, 403);
                }

                // Create the role document
                const role = await databases.createDocument(
                    DATABASE_ID,
                    Roles_ID,
                    ID.unique(),
                    {
                        workspaceId,
                        roleName,
                        manageProjects: manageProjects ?? false,
                        manageTeams: manageTeams ?? false,
                        manageUserStories: manageUserStories ?? false,
                        manageTasks: manageTasks ?? false,
                        manageAnalytics: manageAnalytics ?? false,
                    }
                );

                return c.json({ data: role }, 201);
            } catch (error: any) {
                console.error("Error creating role:", error);
                return c.json({ error: error.message || "Failed to create role" }, 500);
            }
        }
    );

export default app;