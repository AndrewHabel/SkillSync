// lib/sendEmail.ts
import SkillSyncHelloEmail from "@/components/emails/welcomemail";
import AssignedTask from "@/components/emails/you-have-been-assigned-task";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  return await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Welcome to the App! 🎉",
    react: SkillSyncHelloEmail({username: name}),
  });
}

export async function sendAssignEmail(
  to: string, 
  assignename: string , 
  taskname: string , 
  workspacename: string , 
  projectname: string , 
  dueDate: string,
  workSpaceId : string,
  taskId : string,
) {
  return await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Welcome to the App! 🎉",
    react: AssignedTask({
                assignename: assignename,
                workspacename: workspacename,
                projectname: projectname,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                taskname: taskname,
                workSpaceId: workSpaceId,
                taskId: taskId,
              }),
  });
}