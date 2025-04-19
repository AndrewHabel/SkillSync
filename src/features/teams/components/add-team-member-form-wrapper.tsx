import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { AddTeamMemberForm } from "./add-team-member-form";

interface AddTeamMemberFormWrapperProps {
    onCancel: () => void;
    teamId: string;
}

export const AddTeamMemberFormWrapper = ({ onCancel, teamId }: AddTeamMemberFormWrapperProps) => { 
    const workspaceId = useWorkspaceId();
    const { data: members, isLoading } = useGetMembers({ workspaceId });

    const memberOptions = members?.documents.map(member => ({ id: member.$id, name: member.name }));

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