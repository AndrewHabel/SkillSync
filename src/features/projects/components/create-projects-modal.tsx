"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateProjectForm } from "./create-projects-form";
import { useCreateProjectModal } from "../hooks/use-create-project-modal";
import { useCurrent } from "@/features/auth/api/use-current";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const CreateProjectModal = () => {
    const {isOpen, setIsOpen, close} = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    const { data: user } = useCurrent();
    const { data: members } = useGetMembers({ workspaceId });
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    // Check if the current user is an admin
    useEffect(() => {
        if (members && user && Array.isArray(members.documents)) {
            // Find the current user's member document
            const currentUserMember = members.documents.find(member => 
                member.userId === user.$id
            );
            
            if (currentUserMember) {
                setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
            } else {
                setIsAdmin(false);
            }
        }
    }, [members, user]);

    // Close modal and redirect if not admin
    useEffect(() => {
        if (isOpen && !isAdmin) {
            setIsOpen(false);
            router.push(`/workspaces/${workspaceId}`);
        }
    }, [isOpen, isAdmin, setIsOpen, router, workspaceId]);

    if (!isAdmin) return null;

    return (
        <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
            <CreateProjectForm onCancel={close} />
        </ResponsiveModal>
    )
}