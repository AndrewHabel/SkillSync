"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { InviteUserForm } from "./invite-user-form";
import { useInviteUserModal } from "../hooks/use-invite-user-modal";

interface InviteUserModalProps {
  workspaceName: string;
  workspaceOwner: string;
  inviteCode: string;
}

export const InviteUserModal = ({ 
  workspaceName, 
  workspaceOwner,
  inviteCode 
}: InviteUserModalProps) => {
  const { isOpen, setIsOpen, close } = useInviteUserModal();

  return (
    <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
      <InviteUserForm 
        onCancel={close} 
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        inviteCode={inviteCode}
      />
    </ResponsiveModal>
  );
}