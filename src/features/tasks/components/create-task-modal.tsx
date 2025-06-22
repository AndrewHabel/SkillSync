"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";
import { useCurrent } from "@/features/auth/api/use-current";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const CreateTaskModal = () => {
    const { isOpen, setIsOpen, close } = useCreateTaskModal();
    const { data: user } = useCurrent();
    const workspaceId = useWorkspaceId();
    const { data: members } = useGetMembers({ workspaceId });
    const [isAdmin, setIsAdmin] = useState(false);
    const [canManageTasks, setCanManageTasks] = useState(false);
    const router = useRouter();

    // Check if the current user is an admin or can manage tasks
    useEffect(() => {
        if (members && user && Array.isArray(members.documents)) {
            const currentUserMember = members.documents.find(member => 
                member.userId === user.$id
            );
            
            if (currentUserMember) {
                setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
                setCanManageTasks(currentUserMember.specialRole?.documents?.[0]?.manageTasks === true || currentUserMember.role === MemberRole.ADMIN);
            } else {
                setIsAdmin(false);
                setCanManageTasks(false);
            }
        }
    }, [members, user]);

    // Close modal if not authorized
    useEffect(() => {
        if (isOpen && !isAdmin && !canManageTasks) {
            setIsOpen(false);
        }
    }, [isOpen, isAdmin, canManageTasks, setIsOpen]);

    if (!isAdmin && !canManageTasks) return null;
    
    return (
        <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
            <div>
               <CreateTaskFormWrapper onCancel={close} />
            </div>
        </ResponsiveModal>
    );
}