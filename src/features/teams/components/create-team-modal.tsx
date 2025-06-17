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
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();
  const { data: members } = useGetMembers({ workspaceId });
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the current user is an admin
  useEffect(() => {
    if (members && user && Array.isArray(members.documents)) {
      // Find the current user's member document
      const currentUserMember = members.documents.find(
        (member) => member.userId === user.$id
      );

      if (currentUserMember) {
        setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
      } else {
        setIsAdmin(false);
      }
    }
  }, [members, user]);

  // Close modal if not admin
  useEffect(() => {
    if (isOpen && !isAdmin) {
      setIsOpen(false);
    }
  }, [isOpen, isAdmin, setIsOpen]);

  if (!isAdmin) return null;

  return (
    <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
      <div>
        <CreateTeamFormWrapper onCancel={close} />
      </div>
    </ResponsiveModal>
  );
};