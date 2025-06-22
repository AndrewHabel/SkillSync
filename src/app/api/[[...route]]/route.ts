import {Hono} from "hono";
import {handle} from"hono/vercel"; 

import auth from "@/features/auth/server/route";
import members from "@/features/members/server/route";
import workspaces from "@/features/workspaces/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import userStories from "@/features/UserStories/server/route";
import taskgeneration from "@/features/taskgeneration/server/routes";
import taskInfoGeneration from "@/features/TaskInfoGeneration/server/routes";
import teams from "@/features/teams/server/route";
import codegeneration from "@/features/CodeGeneration/server/routes";
import skill from "@/features/skill/server/route";
import Roles from "@/features/Roles/server/route";
import taskdependencies from "@/features/TasksDependencies/server/route";


const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/auth",auth)
  .route("/workspaces",workspaces)
  .route("/members",members)
  .route("/projects",projects)
  .route("/tasks",tasks)
  .route("/userStories",userStories)
  .route("/taskgeneration",taskgeneration)
  .route("/taskInfoGeneration",taskInfoGeneration)
  .route("/teams",teams)
  .route("/codegeneration",codegeneration)
  .route("/skill", skill)
  .route("/TasksDependencies", taskdependencies)
  .route("/Roles",Roles)

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;
