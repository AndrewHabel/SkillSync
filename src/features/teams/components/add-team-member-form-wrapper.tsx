import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { AddTeamMemberForm } from "./add-team-member-form";
import { useCurrent } from "@/features/auth/api/use-current";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AddTeamMemberFormWrapperProps {
    onCancel: () => void;
    teamId: string;
}

export const AddTeamMemberFormWrapper = ({ onCancel, teamId }: AddTeamMemberFormWrapperProps) => { 
    const workspaceId = useWorkspaceId();
    const { data: members, isLoading } = useGetMembers({ workspaceId });
    
    // Get current user and check role
    const { data: user } = useCurrent();
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Check if the current user is an admin
    useEffect(() => {
        if (members && user && Array.isArray(members.documents)) {
            // Find the current user's member document
            const currentUserMember = members.documents.find((member) => 
                member.userId === user.$id
            );
            
            if (currentUserMember) {
                setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
            } else {
                setIsAdmin(false);
            }
        }
    }, [members, user]);
    
    // Redirect non-admin users away from this form
    useEffect(() => {
        if (!isLoading && members && !isAdmin) {
            onCancel();
        }
    }, [isLoading, members, isAdmin, onCancel]);

    // Filter out members with ADMIN role
    const filteredMembers = members?.documents.filter((member) => member.role !== MemberRole.ADMIN);
    const memberOptions = filteredMembers?.map((member) => ({ id: member.$id, name: member.name }));

    if (isLoading) {
        return (
            <Card className="w-full h-[450px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground"/>
                </CardContent>
            </Card>
        );
    }

    return (
        <AddTeamMemberForm 
            onCancel={onCancel} 
            teamId={teamId} 
            memberOptions={memberOptions ?? []}
        />
    );
};