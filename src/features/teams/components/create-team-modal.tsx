"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateTeamModal } from "../hooks/use-create-team-modal";
import { CreateTeamFormWrapper } from "./create-team-form-wrapper";
import { useEffect, useState } from "react";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";

export const CreateTeamModal = () => {
  const { isOpen, setIsOpen, close } = useCreateTeamModal();
  const workspaceId = useWorkspaceId();  const { data: user } = useCurrent();
  const { data: members } = useGetMembers({ workspaceId });
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageTeams, setCanManageTeams] = useState(false);

  // Check if the current user is an admin or has team management permissions
  useEffect(() => {
    if (members && user && Array.isArray(members.documents)) {
      // Find the current user's member document
      const currentUserMember = members.documents.find(
        (member) => member.userId === user.$id
      );

      if (currentUserMember) {
        setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
        
        // Check for special role permissions
        if (currentUserMember.specialRole?.documents?.[0]) {
          const specialRole = currentUserMember.specialRole.documents[0];
          setCanManageTeams(!!specialRole.manageTeams);
        }

      } else  {
        setIsAdmin(false);
        setCanManageTeams(false);
      }
    }
  }, [members, user]);

  // Allow team creation for admins OR users with manageTeams permission
  const canCreateTeams = isAdmin || canManageTeams;

  // Close modal if not authorized
  useEffect(() => {
    
  }, [isOpen, canCreateTeams, setIsOpen]);

  if (!canCreateTeams) return null;  return (
    <ResponsiveModal 
      open={isOpen} 
      onopenchange={setIsOpen}
      title="Create Team"
      description="Create a new team for your project"
    >
      <div>
        <CreateTeamFormWrapper onCancel={close} />
      </div>
    </ResponsiveModal>
  );
};