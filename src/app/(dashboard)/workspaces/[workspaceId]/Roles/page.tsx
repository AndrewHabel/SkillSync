"use client";

import { useState } from "react";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCreateRole } from "@/features/Roles/api/use-create-role";
import { useGetRoles } from "@/features/Roles/api/use-get-roles";
import { useQueryClient } from "@tanstack/react-query";
import { Role as ApiRole } from "@/features/Roles/types";

// Define role permissions
const availablePermissions = [
  { id: "manageProjects", label: "Manage Projects", key: "manageProjects" },
  { id: "manageTeams", label: "Manage Teams", key: "manageTeams" },
  { id: "manageUserStories", label: "Manage User Stories", key: "manageUserStories" },
  { id: "manageTasks", label: "Manage Tasks", key: "manageTasks" },
  { id: "manageAnalytics", label: "Analytics", key: "manageAnalytics" },
];

// Local Role interface for the form
interface RoleForm {
  name: string;
  permissions: string[];
}

const RolesPage = () => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  
  const { data: roles, isLoading, isError, error } = useGetRoles({ 
    workspaceId: workspaceId || "" 
  });
  
  const createRoleMutation = useCreateRole();
  
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState<RoleForm>({ name: "", permissions: [] });
  
  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      
      return { ...prev, permissions };
    });
  };  
  
  const handleCreateRole = async () => {
    if (!newRole.name.trim() || !workspaceId) return;
    setIsSubmitting(true);
    
    try {
      // Convert permissions array to individual boolean flags
      // This ensures each permission is explicitly set to true or false
      const permissionData: Record<string, boolean> = {
        manageProjects: false,
        manageTeams: false,
        manageUserStories: false,
        manageTasks: false,
        manageAnalytics: false
      };
      
      // Set selected permissions to true
      availablePermissions.forEach(permission => {
        permissionData[permission.key] = newRole.permissions.includes(permission.id);
      });
      
      await createRoleMutation.mutateAsync({
        json: {
          workspaceId,
          roleName: newRole.name,
          ...permissionData
        }
      });
      
      // Reset form and close dialog
      setNewRole({ name: "", permissions: [] });
      setOpen(false);
      
      // Invalidate query to refetch roles
      queryClient.invalidateQueries({ queryKey: ["roles", workspaceId] });
    } catch (error) {
      console.error("Error creating role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteRole = async (roleId: string) => {
    // For future implementation: Delete role API call
    console.log("Delete role with ID:", roleId);
    // After deleting, invalidate the query to refetch:
    // queryClient.invalidateQueries({ queryKey: ["roles", workspaceId] });
  };
  
  // Helper function to convert API role permissions to our permission IDs format
  const getRolePermissionIds = (role: ApiRole): string[] => {
    return availablePermissions
      .filter(permission => role[permission.key as keyof ApiRole] === true)
      .map(permission => permission.id);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role with specific permissions for your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input 
                  id="role-name" 
                  placeholder="Enter role name" 
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={permission.id}
                        checked={newRole.permissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />                      
                      <label
                        htmlFor={permission.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleCreateRole} disabled={isSubmitting || !newRole.name.trim()}>
                {isSubmitting ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      
      {isError && (
        <div className="py-8 text-center">
          <p className="text-destructive">Error loading roles. {error?.message}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["roles", workspaceId] })}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {!isLoading && !isError && roles && roles.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No roles created yet. Create your first role to get started.</p>
        </div>
      )}
      
      {!isLoading && !isError && roles && roles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.$id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{role.roleName}</CardTitle>
                  <CardDescription>
                    {getRolePermissionIds(role).length} permission{getRolePermissionIds(role).length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteRole(role.$id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {getRolePermissionIds(role).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getRolePermissionIds(role).map((permId) => {
                      const permission = availablePermissions.find(p => p.id === permId);
                      return (
                        <Badge key={permId} variant="secondary">
                          {permission?.label || permId}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No permissions assigned</p>
                )}
              </CardContent>
            </Card>
          ))}      
        </div>
      )}
    </div>
  );
};

export default RolesPage;