export interface Role {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $collectionId: string;
  $databaseId: string;
  $permissions: string[];
  workspaceId: string;
  roleName: string;
  manageProjects: boolean;
  manageTeams: boolean;
  manageUserStories: boolean;
  manageTasks: boolean;
  manageAnalytics: boolean;
  [key: string]: any; // For any additional properties
}

export interface RolesResponse {
  data: Role[];
}
