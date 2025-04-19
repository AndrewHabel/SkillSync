"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useAddTeamMemberModal } from "../hooks/use-add-team-member-modal";
import { AddTeamMemberFormWrapper } from "./add-team-member-form-wrapper";

export const AddTeamMemberModal = () => {
    const { teamId, close } = useAddTeamMemberModal();

    return (
        <ResponsiveModal open={!!teamId} onopenchange={close}>
            {teamId && (
                <AddTeamMemberFormWrapper 
                    teamId={teamId} 
                    onCancel={close} 
                />
            )}
        </ResponsiveModal>
    );
};