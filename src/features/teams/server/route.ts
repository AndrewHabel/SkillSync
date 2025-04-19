import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTeamSchema, updateTeamSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TEAMS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Team } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";
import { Member } from "@/features/members/types";

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTeamSchema),
    async(c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        workspaceId,
        projectId,
        teamtype,
        membersId
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const team = await databases.createDocument(
        DATABASE_ID,
        TEAMS_ID,
        ID.unique(),
        {
          workspaceId,
          projectId,
          teamtype,
          membersId: [],
        },
      );

      return c.json({ data: team })
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ 
      workspaceId: z.string(),
      projectId: z.string().nullish(),
      teamtype: z.string().nullish(),
    })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId, projectId, teamtype } = c.req.valid("query");
    
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if(projectId){
        query.push(Query.equal("projectId", projectId));
      }

      if(teamtype){
        query.push(Query.equal("teamtype", teamtype));
      }

      const teams = await databases.listDocuments<Team>(
        DATABASE_ID,
        TEAMS_ID,
        query,
      );  

      const projectIds = teams.documents
        .map((team) => team.projectId)
        .filter((id): id is string => id !== null && id !== undefined);
      
      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
      );


      const memberIds = teams.documents
        .flatMap((team) => team.members || [])
        .filter((id): id is string => id !== null && id !== undefined);

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        memberIds.length > 0 ? [Query.contains("$id", memberIds)] : [],
      );

      const teamMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          const username = user.email.split('@')[0];

          return {
            ...member,
            name: user.name || username,
            email: user.email,
          };
        })
      );


      const populatedTeams = teams.documents.map((team) => {
        const project = team.projectId 
          ? projects.documents.find((project) => project.$id === team.projectId) 
          : null;
        
        const teamMembersList = team.membersId
          ? teamMembers.filter((member) => team.membersId?.includes(member.$id))
          : [];
        
        

        return {
          ...team,
          project,
          membersList: teamMembersList,
          memberCount: teamMembersList.length
        };
      });

      return c.json({ data: { ...teams, documents: populatedTeams } });
    },
  )
  .get(
    "/:teamId",
    sessionMiddleware,
    async (c) => {
      const currentUser = c.get("user");
      const databases = c.get("databases");
      const { users } = await createAdminClient();
      const { teamId } = c.req.param();

      const team = await databases.getDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
      );
      
      const currentMember = await getMember({
        databases,
        workspaceId: team.workspaceId,
        userId: currentUser.$id,
      });

      if(!currentMember){
        return c.json({error: "Unauthorized"}, 401);
      }

      const project = team.projectId ? await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        team.projectId
      ) : null;

      // Get team members
      const memberIds = team.members || [];
      let teamMembers: any[] = [];
      
      if (memberIds.length > 0) {
        try {
          const membersData = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.contains("$id", memberIds)]
          );
          
          teamMembers = await Promise.all(
            membersData.documents.map(async (member) => {
              const user = await users.get(member.userId);
              const username = user.email.split('@')[0];
              return {
                ...member,
                name: user.name || username,
                email: user.email,
              };
            })
          );
        } catch (error) {
          console.error("Error fetching team members:", error);
        }
      }

      return c.json({
        data: {
          ...team,
          project,
          members: teamMembers,
        },
      });
    }
  )
  .patch(
    "/:teamId",
    sessionMiddleware,
    zValidator("json", updateTeamSchema),
    async(c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        projectId,
        teamtype,
      } = c.req.valid("json");

      const { teamId } = c.req.param();

      const existingTeam = await databases.getDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
      );
    
      const member = await getMember({
        databases,
        workspaceId: existingTeam.workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const team = await databases.updateDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
        {
          projectId,
          teamtype,
        },
      );

      return c.json({ data: team })
    }
  )
  .delete(
    "/:teamId",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { teamId } = c.req.param();

      const team = await databases.getDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
      );

      if(!team){
        return c.json({error: "Team not found"}, 404);
      }

      const member = await getMember({
        databases,
        workspaceId: team.workspaceId,
        userId: user.$id,
      });

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      await databases.deleteDocument(
        DATABASE_ID, 
        TEAMS_ID, 
        teamId
      );

      return c.json({ data: { $id: team.$id } });
    }
  )
  .delete(
    "/:teamId/members/:memberId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { teamId, memberId } = c.req.param();

      const team = await databases.getDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
      );

      if (!team) {
        return c.json({ error: "Team not found" }, 404);
      }

      const currentMember = await getMember({
        databases,
        workspaceId: team.workspaceId,
        userId: user.$id,
      });

      if (!currentMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const currentMembers = team.membersId || []; // Corrected: Use membersId
      
      if (!currentMembers.includes(memberId)) {
        return c.json({ error: "Member not in team" }, 400);
      }

      const updatedMembers = currentMembers.filter((id: string) => id !== memberId); // Added explicit type for id

      const updatedTeam = await databases.updateDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
        {
          membersId: updatedMembers // Corrected: Update membersId
        }
      );

      return c.json({ data: updatedTeam });
    }
  )
  .post(
    "/:teamId/members/:memberId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { teamId, memberId } = c.req.param();

      const team = await databases.getDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
      );

      if (!team) {
        return c.json({ error: "Team not found" }, 404);
      }

      const currentMember = await getMember({
        databases,
        workspaceId: team.workspaceId,
        userId: user.$id,
      });

      if (!currentMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Verify that the member to be added exists in the workspace
      const memberToAdd = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      );

      if (!memberToAdd || memberToAdd.workspaceId !== team.workspaceId) {
        return c.json({ error: "Member not found in workspace" }, 404);
      }

      const currentMembers = team.membersId || []; // Corrected: Use membersId
      
      if (currentMembers.includes(memberId)) {
        return c.json({ error: "Member already in team" }, 400);
      }

      const updatedMembers = [...currentMembers, memberId];

      const updatedTeam = await databases.updateDocument<Team>(
        DATABASE_ID,
        TEAMS_ID,
        teamId,
        {
          membersId: updatedMembers
        }
      );

      return c.json({ data: updatedTeam });
    }
  );

export default app;