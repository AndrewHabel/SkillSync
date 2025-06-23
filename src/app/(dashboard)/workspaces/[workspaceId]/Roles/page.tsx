"use client";

import { useState } from "react";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCreateRole } from "@/features/Roles/api/use-create-role";
import { useGetRoles } from "@/features/Roles/api/use-get-roles";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useQueryClient } from "@tanstack/react-query";
import { Role as ApiRole } from "@/features/Roles/types";
import { MemberRole } from "@/features/members/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const availablePermissions = [
  { id: "manageProjects", label: "Manage Projects", key: "manageProjects" },
  { id: "manageTeams", label: "Manage Teams", key: "manageTeams" },
  { id: "manageUserStories", label: "Manage User Stories", key: "manageUserStories" },
  { id: "manageTasks", label: "Manage Tasks", key: "manageTasks" },
  { id: "manageAnalytics", label: "Analytics", key: "manageAnalytics" },
  { id: "manageMembers", label: "Manage Members", key: "manageMembers" },
];

interface RoleForm {
  name: string;
  permissions: string[];
}

interface MemberWithRoleId {
  memberId: string;
  roleId: string | null;
}

const RolesPage = () => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  
  const { data: roles, isLoading, isError, error } = useGetRoles({ 
    workspaceId: workspaceId || "" 
  });
  
  const { data: membersData, isLoading: isMembersLoading, isError: isMembersError } = useGetMembers({
    workspaceId: workspaceId || ""
  });
 
  const members = membersData?.documents || [];
  const updateMemberMutation = useUpdateMember();
  const createRoleMutation = useCreateRole();
  
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState<RoleForm>({ name: "", permissions: [] });
  
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Find the currently selected member
  const getSelectedMemberDetails = () => {
    if (!selectedMember) return null;
    return members.find(member => member.$id === selectedMember);
  };
  
  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      
      return { ...prev, permissions };
    });
  };  
  
  const openAssignRoleDialog = (memberId: string) => {
    const member = members.find(m => m.$id === memberId);
    
    setSelectedMember(memberId);
    // Initialize with current specialRoleId if it exists
    setSelectedRole(member?.specialRoleId || null);
    setAssignRoleOpen(true);
  };
  const assignRoleToMember = async () => {
    if (!selectedMember || !selectedRole) return;
    
    try {
      // Get the member details to include required name field
      const memberDetails = getSelectedMemberDetails();
      if (!memberDetails) return;
      
      // Call the mutation to update the member with required fields
      await updateMemberMutation.mutateAsync({
        param: {
          memberId: selectedMember
        },
        form: {
          name: memberDetails.name || "",
          specialRoleId: selectedRole
        }
      });
      
      // Close dialog
      setAssignRoleOpen(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
      
      toast.success("Role assigned successfully");
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role");
    }
  };
    // Get assigned role for a member
  const getMemberRoleName = (member: any) => {
    if (!member.specialRoleId || !roles) return null;
    
    const role = roles.find(r => r.$id === member.specialRoleId);
    return role ? role.roleName : null;
  };
  
  const handleCreateRole = async () => {
    if (!newRole.name.trim() || !workspaceId) return;
    setIsSubmitting(true);
    
    try {
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
    console.log("Delete role with ID:", roleId);
  };
  
  // Helper function to convert API role permissions to our permission IDs format
  const getRolePermissionIds = (role: ApiRole): string[] => {
    return availablePermissions
      .filter(permission => role[permission.key as keyof ApiRole] === true)
      .map(permission => permission.id);
  };
  
  return (
    <div className="p-6 space-y-8">
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
              </div>              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
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
      
      {/* Role Assignment Dialog */}
      <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              {getSelectedMemberDetails()?.name 
                ? `Assign a role to ${getSelectedMemberDetails()?.name}`
                : "Select a role to assign to this member."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="role-select">Select Role</Label>
            <Select value={selectedRole || ""} onValueChange={setSelectedRole}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {!isLoading && roles && roles.map(role => (
                  <SelectItem key={role.$id} value={role.$id}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoleOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={assignRoleToMember} 
              disabled={!selectedRole || updateMemberMutation.isPending}
            >
              {updateMemberMutation.isPending ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Roles Loading and Error States */}
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
      
      {/* Roles List */}
      {!isLoading && !isError && roles && roles.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-4">Workspace Roles</h2>
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
        </>
      )}
      
      {/* Members Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Workspace Members
        </h2>
        
        {isMembersLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        {isMembersError && (
          <div className="py-8 text-center">
            <p className="text-destructive">Error loading members.</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })}
            >
              Try Again
            </Button>
          </div>
        )}
        
        {!isMembersLoading && !isMembersError && members.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No members in this workspace.</p>
          </div>
        )}
        
        {!isMembersLoading && !isMembersError && members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card key={member.$id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="mb-4">User Name: {member.name}</CardTitle>
                    <CardDescription>
                      {member.role === MemberRole.ADMIN ? (
                        <Badge variant="default">Admin</Badge>
                      ) : (
                        <Badge variant="secondary">Member</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openAssignRoleDialog(member.$id)}
                    title="Assign Role"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Member since: {new Date(member.$createdAt).toLocaleDateString()}
                  </p>
                    {member.specialRoleId && getMemberRoleName(member) && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Assigned Role:</p>
                      <Badge variant="outline" className="bg-primary/5">
                        {getMemberRoleName(member)}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPage;