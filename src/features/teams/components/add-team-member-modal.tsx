"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useAddTeamMemberModal } from "../hooks/use-add-team-member-modal";
import { AddTeamMemberFormWrapper } from "./add-team-member-form-wrapper";

export const AddTeamMemberModal = () => {
    const { teamId, close } = useAddTeamMemberModal();
    
    // Debug log
    console.log("AddTeamMemberModal - teamId:", teamId, "Modal should be open:", !!teamId);    return (
        <ResponsiveModal 
            open={!!teamId} 
            onopenchange={close}
            title="Add Team Member"
            description="Add new member to the team"
        >
            {teamId && (
                <AddTeamMemberFormWrapper 
                    teamId={teamId} 
                    onCancel={close} 
                />
            )}
        </ResponsiveModal>
    );
};