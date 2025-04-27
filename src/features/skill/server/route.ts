import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { DATABASE_ID, SKILLS_ID } from "@/config";
import { ID, Query } from "node-appwrite";

import { ExpertiseLevel } from "../types";
import { bulkCreateSkillSchema } from "../schema";
import { getMember } from "@/features/members/utils";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string(),
            userId: z.string().optional()
        })),
        async (c) => {
            const {users} = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId, userId } = c.req.valid("query");

             const member = await getMember({
                databases,
                workspaceId: workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: "Member not found" }, 404);
            }

            const filters = [];
                
            if (userId) {
                filters.push(Query.equal("userId", userId));
            }

            const skills = await databases.listDocuments(
                DATABASE_ID,
                SKILLS_ID,
                filters
            );

            console.log(skills.documents);

            return c.json({ data: skills });
        }
    )
    .post(
        "/bulk-create",
        sessionMiddleware,
        zValidator("json", bulkCreateSkillSchema),
        async (c) => {
            const databases = c.get("databases");
            const { skills , workspaceId} = c.req.valid("json");
            
            console.log(skills);

            // Process each skill
            const createdSkills = await Promise.all(
                skills.map(async (skill) => {
                    // Check if a skill with the same name already exists for this user
                    const existingSkills = await databases.listDocuments(
                        DATABASE_ID,
                        SKILLS_ID,
                        [
                            Query.equal("skillname", skill.skillName),
                            Query.equal("userId", skill.userId),
                        ]
                    );

                    if (existingSkills.documents.length > 0) {
                        // Update the existing skill
                        return await databases.updateDocument(
                            DATABASE_ID,
                            SKILLS_ID,
                            existingSkills.documents[0].$id,
                            {
                                experienceLevel: skill.experienceLevel
                            }
                        );
                    } else {
                        // Create a new skill document
                        return await databases.createDocument(
                            DATABASE_ID,
                            SKILLS_ID,
                            ID.unique(),
                            {
                                skillname: skill.skillName,
                                userId: skill.userId,
                                experienceLevel: skill.experienceLevel,
                            }
                        );
                    }
                })
            );

            return c.json({ data: { success: true, count: createdSkills.length } });
        }
    )
    .delete(
        "/:skillId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const { skillId } = c.req.param();
            const user = c.get("user");

            // Get the skill
            const skill = await databases.getDocument(
                DATABASE_ID,
                SKILLS_ID,
                skillId
            );

            // Verify the user owns the skill
            if (skill.memberId !== user.$id) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // Delete the skill
            await databases.deleteDocument(
                DATABASE_ID,
                SKILLS_ID,
                skillId
            );

            return c.json({ data: { success: true } });
        }
    );

export default app;