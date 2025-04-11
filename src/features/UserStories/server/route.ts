import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createUserStorySchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, USERSTORIES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod"; 
import { UserStory } from "../types";

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createUserStorySchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        workspaceId,
        projectId,
        description,
        AcceptanceCriteria,
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const userStory = await databases.createDocument(
        DATABASE_ID,
        USERSTORIES_ID,
        ID.unique(),
        {
        workspaceId,
        projectId,
        description,
        AcceptanceCriteria,
        }
      );

      return c.json(userStory);
    }
  )
  .get(
    "/",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        workspaceId,
        projectId,
      } = c.req.query();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const userStories = await databases.listDocuments(
        DATABASE_ID,
        USERSTORIES_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("projectId", projectId),
        ],
      );

      return c.json({data:userStories});
    }
  )
  .get(
    "/:userStoryId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {userStoryId} = c.req.param();    

      const userStory = await databases.getDocument<UserStory>(
        DATABASE_ID,
        USERSTORIES_ID,
        userStoryId,
      );

      const member = await getMember({
        databases,
        workspaceId: userStory.workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      return c.json({data:{...userStory}});
    }
  )
  .patch(
    "/:userStoryId",
    sessionMiddleware,
    zValidator("json", createUserStorySchema.partial()),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        description,
        AcceptanceCriteria,
      } = c.req.valid("json");

      const { userStoryId } = c.req.param();

      const existingUserStory = await databases.getDocument(
        DATABASE_ID,
        USERSTORIES_ID,
        userStoryId,
      );

      const member = await getMember({  
        databases,
        workspaceId: existingUserStory.workspaceId,
        userId: user.$id,
      })

      if(!member){  
        return c.json({error: "Unauthorized"}, 401);
      }

      const userStory = await databases.updateDocument(
        DATABASE_ID,
        USERSTORIES_ID, 
        userStoryId,
        {
          description,
          AcceptanceCriteria,
        }
      );        

      return c.json(userStory);
    }
  )
  .delete(
    "/:userStoryId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { userStoryId } = c.req.param();
      
      const existingUserStory = await databases.getDocument(
        DATABASE_ID,
        USERSTORIES_ID,
        userStoryId,
      );

      if(!existingUserStory){
        return c.json({error: "User Story not found"}, 404);
      }

      const member = await getMember({
        databases,
        workspaceId: existingUserStory.workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      await databases.deleteDocument(
        DATABASE_ID,
        USERSTORIES_ID,
        userStoryId,
      );

      return c.json({ data: { $id: existingUserStory.$id } });
      
      
      
    },
  )

export default app;