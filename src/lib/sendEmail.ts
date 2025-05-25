// lib/sendEmail.ts
import SkillSyncHelloEmail from "@/components/emails/welcomemail";
import AssignedTask from "@/components/emails/you-have-been-assigned-task";
import InvitedToWorkspace from "@/components/emails/you-have-been-invited-to-workspace";
import sgMail from '@sendgrid/mail';
import { render, renderAsync } from '@react-email/render';


export async function sendWelcomeEmail(to: string, name: string) {

  const html = await render(SkillSyncHelloEmail({username: name}));

  sgMail.setApiKey(process.env.SEND_GRID_API_KEY!);
  
  const FROM_EMAIL = 'mohammedadnan.cs@hotmail.com';

  return await sgMail.send({
    from: FROM_EMAIL,
    to:to,
    subject: "Welcome to SkillSync! 🎉",
    html,
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

  const emailContent = AssignedTask({
    assignename: assignename,
    workspacename: workspacename,
    projectname: projectname,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    taskname: taskname,
    workSpaceId: workSpaceId,
    taskId: taskId,
  });
  
    // Initialize SendGrid with API key
  sgMail.setApiKey(process.env.SEND_GRID_API_KEY!);

  // Set the sender email
  const FROM_EMAIL = 'mohammedadnan.cs@hotmail.com';

  // Render React component to HTML
  const html = await render(emailContent);

  // Send the email using SendGrid
  return await sgMail.send({
    from: FROM_EMAIL,
    to:to,
    subject: "You've been assigned a task in SkillSync",
    html,
  });
}


export async function sendInvitedToWorkspace(
  to: string, 
  invitedUserName: string, 
  workspacename: string, 
  workSpaceId : string,
  workspaceOwner : string,
  inviteCode: string,
) {
  const emailContent = InvitedToWorkspace({
    invitedUserName: invitedUserName,
    workspacename: workspacename,
    workSpaceId: workSpaceId,
    workspaceOwner: workspaceOwner,
    inviteLink: inviteCode,
  });

  // Initialize SendGrid with API key
  sgMail.setApiKey(process.env.SEND_GRID_API_KEY!);

  // Set the sender email
  const FROM_EMAIL = 'mohammedadnan.cs@hotmail.com';
  
  // Render React component to HTML
  const html = await render(emailContent);

  // Send the email using SendGrid
  return await sgMail.send({
    from: FROM_EMAIL,
    to:to,
    subject: "You've been invited to join a workspace in SkillSync",
    html,
  });
}