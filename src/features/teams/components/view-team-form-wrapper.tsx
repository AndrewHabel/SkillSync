import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetTeam } from "../api/use-get-team";
import { useRemoveTeamMember } from "../api/use-remove-team-member";
import { useConfirm } from "@/hooks/use-confirm";
import { DottedSeparator } from "@/components/dotted-separator";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { Button } from "@/components/ui/button";
import { UserMinusIcon, Loader, UsersIcon, Trash2Icon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useDeleteTeam } from "../api/use-delete-team";
import { useRouter } from "next/navigation";

interface ViewTeamFormWrapperProps {
  teamId: string;
  onCancel: () => void;
}

export const ViewTeamFormWrapper = ({ teamId, onCancel }: ViewTeamFormWrapperProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: team, isLoading: isLoadingTeam } = useGetTeam({ teamId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { mutate: removeTeamMember, isPending: isRemoving } = useRemoveTeamMember();
  const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam();
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove Member",
    "Are you sure you want to remove this member from the team?",
    "destructive"
  );
  
  const [DeleteTeamDialog, confirmTeamDelete] = useConfirm(
    "Delete Team",
    "Are you sure you want to delete this team? This action cannot be undone.",
    "destructive"
  );

  const handleRemoveMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    removeTeamMember({
      param: {
        teamId,
        memberId
      }
    });
  };
  
  const handleDeleteTeam = async () => {
    const ok = await confirmTeamDelete();
    if (!ok) return;
    
    deleteTeam({ 
      param: { 
        teamId 
      }
    }, {
      onSuccess: () => {
        onCancel(); // Close the modal
      }
    });
  };

  const isLoading = isLoadingTeam || isLoadingMembers;

  if (isLoading) {
    return (
      <Card className="w-full h-[450px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground"/>
        </CardContent>
      </Card>
    );
  }

  if (!team || !members) {
    return (
      <Card className="w-full h-[450px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <p>Team not found.</p>
        </CardContent>
      </Card>
    );
  }

  // Find team members using the membersId array from team data
  const teamMemberIds = team.membersId || [];
  const teamMembers = members.documents.filter(member => 
    teamMemberIds.includes(member.$id)
  );
  
  return (
    <Card className="w-full border-none shadow-none">
      <ConfirmDialog />
      <DeleteTeamDialog />
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold flex items-center">
          <UsersIcon className="size-5 mr-2 text-primary" />
          {team.teamtype}
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <h3 className="font-semibold mb-4">Team Members ({teamMembers.length})</h3>
        <div className="space-y-4 members-list-bg p-5 rounded-lg">
          {teamMembers.length > 0 ? (
            <>
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between p-3 rounded-md bg-accent/30">
                    <div className="flex items-center gap-x-3">
                      <MembersAvatar
                        className="size-10"
                        fallbackclassName="text-lg"
                        name={member.name}
                        imageUrl={member.image}
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveMember(member.$id)}
                      disabled={isRemoving}
                      className="h-9 px-2"
                    >
                      <UserMinusIcon className="size-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  {index !== teamMembers.length - 1 && <Separator className="my-2" />}
                </motion.div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <UsersIcon className="size-12 mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No members in this team yet.</p>
            </div>
          )}
        </div>
        <DottedSeparator className="my-6" />
        <div className="flex justify-between items-center">
          <Button
            variant="destructive"
            onClick={handleDeleteTeam}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2Icon className="size-4" />
            Delete Team
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};