"use client";

import { TeamAvatar } from "./team-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateTeamModal } from "../hooks/use-create-team-modal";
import { useGetTeams } from "../api/use-get-teams";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { DottedSeparator } from "@/components/dotted-separator";
import { Separator } from "@/components/ui/separator";
import { MoreVerticalIcon, PlusIcon } from "lucide-react";
import { useDeleteTeam } from "../api/use-delete-team";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { motion } from "framer-motion";

export const TeamsList = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const { open, CreateTeamModal } = useCreateTeamModal();
  const { data, isLoading } = useGetTeams({ workspaceId, projectId });
  const { mutate: deleteTeam } = useDeleteTeam();
  const { ConfirmDialog, confirm } = useConfirm();

  const handleDeleteTeam = async (teamId: string) => {
    const confirmed = await confirm({
      title: "Delete Team",
      description: "Are you sure you want to delete this team? This action cannot be undone.",
    });

    if (confirmed) {
      deleteTeam({ teamId, projectId });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full border-none shadow-none animate-pulse">
        <CardHeader className="flex p-7">
          <div className="h-7 w-40 bg-muted rounded"></div>
        </CardHeader>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-7 py-3">
            <div className="h-12 bg-muted rounded-md"></div>
          </div>
        ))}
      </Card>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <CreateTeamModal />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-7">
          <CardTitle className="text-xl font-bold">
            Teams
          </CardTitle>
          <Button size="sm" onClick={open}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </CardHeader>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="p-7">
          {data?.data?.documents?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-4">No teams created yet</p>
              <Button size="sm" onClick={open}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create your first team
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.data?.documents?.map((team) => (
                <motion.div
                  key={team.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-x-3">
                    <TeamAvatar team={team} />
                    <div>
                      <p className="font-medium">{team.teamtype}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.membersId?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteTeam(team.$id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};