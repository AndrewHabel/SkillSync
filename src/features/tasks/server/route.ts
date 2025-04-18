import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
import { Search } from "lucide-react";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";
import { Description } from "@radix-ui/react-dialog";
import { bulkCreateTasksSchema } from "@/features/UserStories/schemas";
import assignedTask, { AssignedTask } from "@/components/emails/you-have-been-assigned-task";
import { Member } from "@/features/members/types";
import { getWorkspaces } from "@/features/workspaces/queries";
import { Workspace } from "@/features/workspaces/types";
import { sendAssignEmail } from "@/lib/sendEmail";

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async(c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        workspaceId,
        projectId,
        assigneeId,
        dueDate,
      } = c.req.valid("json");

      console.log("projectId : ", projectId);

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      })

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const highestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ],
      );

      const newPosition = 
        highestPositionTask.documents.length > 0
        ? highestPositionTask.documents[0].position + 1000
        : 1000;

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          position: newPosition
        },
      );

      return c.json({ data: task })
    }
  )
  .post(
    "/bulk-create",
    sessionMiddleware,
    zValidator("json", bulkCreateTasksSchema),
    async(c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { tasks } = c.req.valid("json");
      
      if (tasks.length === 0) {
        return c.json({ error: "No tasks provided" }, 400);
      }
      
      // All tasks should belong to the same workspace
      const workspaceId = tasks[0].workspaceId;
      
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      // Create all tasks
      const createdTasks = await Promise.all(
        tasks.map(async (taskData) => {
          const { name, description, status, projectId, assigneeId, dueDate } = taskData;
          
          // Default position to 1000
          const position = 1000;
          
          return databases.createDocument(
            DATABASE_ID,
            TASKS_ID,
            ID.unique(),
            {
              name,
              description,
              status: status || TaskStatus.BACKLOG, // Default to BACKLOG if null
              workspaceId,
              projectId,
              dueDate,
              assigneeId,
              position
            }
          );
        })
      );

      return c.json({ data: createdTasks });
    }
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ 
      workspaceId: z.string() , 
      projectId: z.string().nullish() , 
      status : z.nativeEnum(TaskStatus).nullish() , 
      assigneeId: z.string().nullish(),
      search: z.string().nullish(),
      dueDate: z.string().nullish(),
    })),

    async (c) => {
      const {users} = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const {workspaceId, projectId, status, assigneeId, search, dueDate} = c.req.valid("query");
    
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
        console.log("projectId : ", projectId);
        query.push(Query.equal("projectId", projectId));
      }

      if(status){
        console.log("status : ", status);
        query.push(Query.equal("status", status));
      }

      if(assigneeId){
        console.log("assigneeId : ", assigneeId);
        query.push(Query.equal("assigneeId", assigneeId));
      }

      if(dueDate){
        console.log("dueDate : ", dueDate);
        query.push(Query.equal("dueDate", dueDate));
      }

      
      if(search){
        console.log("search : ", search);
        query.push(Query.search("name", search));
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query,
      );  

      // Filter out null or undefined projectIds and assigneeIds
      const projectIds = tasks.documents
        .map((task) => task.projectId)
        .filter((id): id is string => id !== null && id !== undefined);
      
      // Filter out null or undefined assigneeIds
      const assigneeIds = tasks.documents
        .map((task) => task.assigneeId)
        .filter((id): id is string => id !== null && id !== undefined);

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
      );

      const assignees = await Promise.all(
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

      const populatedTasks = tasks.documents.map((task) => {
        const project = task.projectId ? projects.documents.find((project) => project.$id === task.projectId) : null;
        const assignee = task.assigneeId ? assignees.find((assignee) => assignee.$id === task.assigneeId) : null;
        
        return {
          ...task,
          project,
          assignee,
        };
      });

      return c.json({ data : { ...tasks , documents: populatedTasks } });
    },
  )
  .delete(
    "/:taskId",
    sessionMiddleware,
    async (c) => {

      const databases = c.get("databases");
      const user = c.get("user");
      const {taskId} = c.req.param();

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      if(!task){
        return c.json({error: "Task not found"}, 404);
      }

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      await databases.deleteDocument(
        DATABASE_ID, 
        TASKS_ID, 
        taskId
      );

      return c.json({ data: { $id: task.$id } });
    },

  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial().extend({
      projectName: z.string().optional(),
      assigneeName: z.string().optional()
    })),
    async(c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        description,
        projectId,
        assigneeId,
        dueDate,
        projectName,
        assigneeName
      } = c.req.valid("json");

      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

    
      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      })

      const workSpace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        existingTask.workspaceId,
      )

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const oldAssigneeId = existingTask.assigneeId;

      const task = await databases.updateDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
        },
      );

      console.log("projectId:", projectId);
      console.log("projectName:", projectName);
      console.log("assigneeId:", assigneeId);
      console.log("assigneeName:", assigneeName);
      console.log("dueDate:", dueDate);
      console.log("status:", status);
      console.log("name:", workSpace.name);



      if(!assigneeId){
        return c.json({data: task});
      }

      const newAssignee = await databases.getDocument<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeId,
      )

      if(oldAssigneeId !== assigneeId ) {

        if (!newAssignee) {
          console.error("Failed to find the assigned member");
          return c.json({data: task});
        }

        // Get the Appwrite user to access their email
        const { users } = await createAdminClient();
        try {
          const userDetails = await users.get(newAssignee.userId);
          
          // Now we have the email from the user's Appwrite record
          await sendAssignEmail(
            userDetails.email || "",
            userDetails.name || "",
            task.name || "",
            workSpace.name || "",
            projectName || "",
            task.dueDate || "",
            task.workspaceId,
            task.$id,
          );
        } catch (error) {
          console.error("Failed to send assignment notification:", error);
        }
      }

      return c.json({ data: task })
    }
  )
  .get(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const currentUser = c.get("user");
      const databases = c.get("databases");
      const { users } = await createAdminClient();
      const { taskId } = c.req.param();

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );
      
      const Currentmember = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: currentUser.$id,
      });

      if(!Currentmember){
        return c.json({error: "Unauthorized"}, 401);
      }

      const project = task.projectId ? await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        task.projectId
      ) : null;

      let assignee = null;
      
      if (task.assigneeId) {
        try {
          const member = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            task.assigneeId,
          );
          
          const user = await users.get(member.userId);
          const username = user.email.split('@')[0];
          assignee = {
            ...member,
            name: user.name || username,
            email: user.email,
          };
        } catch (error) {
          console.error("Error fetching assignee:", error);
        }
      }

      return c.json({
        data: {
          ...task,
          project,
          assignee,
        },
      });
    }
  )
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator("json", z.object({tasks:z.array(z.object({$id:z.string(), status:z.nativeEnum(TaskStatus),position: z.number().int().positive().min(1000).max(1_000_000)}))}),),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const {tasks} = c.req.valid("json");

      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [Query.contains("$id", tasks.map((task) => task.$id))],
      );

      const workspaceIds = new Set(tasksToUpdate.documents.map((task) => task.workspaceId));

      if(workspaceIds.size !== 1){
        return c.json({error: "All Tasks must belong to the same workspace"}, 400);
      }

      const workspaceId = workspaceIds.values().next().value as string;

      if(!workspaceId){
        return c.json({error: "Workspace not found"}, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const updateTasks = await Promise.all(
        tasks.map(async (task) => {
          const {$id , status , position} = task;
        
        return databases.updateDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          $id,
          { status, position }
        )
      })
    );

    return c.json({ data: updateTasks });
    
    }
  )

export default app;