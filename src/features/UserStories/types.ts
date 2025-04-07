import { Models } from "node-appwrite";


export type UserStory = Models.Document & {
  workspaceId: string,
  projectId: string,
  description: string,
  AcceptanceCriteria?: string
}