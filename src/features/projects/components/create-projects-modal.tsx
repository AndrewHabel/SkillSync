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

export const CreateProjectModal = () => {    const {isOpen, setIsOpen, close} = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    const { data: user } = useCurrent();
    const { data: members } = useGetMembers({ workspaceId });
    const [isAdmin, setIsAdmin] = useState(false);
    const [canManageProjects, setCanManageProjects] = useState(false);
    const router = useRouter();

    // Check if the current user is an admin or has project management permissions
    useEffect(() => {
        if (members && user && Array.isArray(members.documents)) {
            // Find the current user's member document
            const currentUserMember = members.documents.find(member => 
                member.userId === user.$id
            );
            
            if (currentUserMember) {
                setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
                
                // Check for special role permissions
                if (currentUserMember.specialRole?.documents?.[0]) {
                    const specialRole = currentUserMember.specialRole.documents[0];
                    setCanManageProjects(!!specialRole.manageProjects);
                }
            } else {
                setIsAdmin(false);
                setCanManageProjects(false);
            }
        }
    }, [members, user]);

    // Allow project creation for admins OR users with manageProjects permission
    const canCreateProjects = isAdmin === true || canManageProjects === true;

    // Close modal and redirect if not authorized
    useEffect(() => {
        if (isOpen && !canCreateProjects) {
            setIsOpen(false);
            router.push(`/workspaces/${workspaceId}`);
        }
    }, [isOpen, canCreateProjects, setIsOpen, router, workspaceId]);

    if (!canCreateProjects) return null;

    return (
        <ResponsiveModal open={isOpen} onopenchange={setIsOpen}>
            <CreateProjectForm onCancel={close} />
        </ResponsiveModal>
    )
}