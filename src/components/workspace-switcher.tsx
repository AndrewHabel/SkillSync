"use client";
import {RiAddCircleFill} from "react-icons/ri"
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import{
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar"
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";
import { useCurrent } from "@/features/auth/api/use-current";
import { useEffect, useState } from "react";


export const WorkspaceSwitcher = () => {
  
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const {data: workspaces} = useGetWorkspaces();
  const {open} = useCreateWorkspaceModal();
  const { data: user } = useCurrent();
  const { data: members } = useGetMembers({ workspaceId });
  const [isAdmin, setIsAdmin] = useState(false);

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
        // If no membership is found, allow creating workspaces (e.g., first-time user)
        setIsAdmin(true);
      }
    } else if (!members && user) {
      // If no workspace is selected, allow creating workspaces
      setIsAdmin(true);
    }
  }, [members, user, workspaceId]);

  const onSelect = (workspaceId: string) => {
    router.push(`/workspaces/${workspaceId}`);
  };

  return(
    <div className="flex flex-col gap-y-2">
      <div className=" flex items-center justify-between">
        <p className="text-xs uppercase text-primary font-semibold">Workspaces</p>
        {isAdmin && (
          <RiAddCircleFill onClick={open} className="size-5 text-primary cursor-pointer hover:opacity-75 transition" />
        )}
      </div>
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-accent/50 font-medium p-1 border border-border">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspace) => (
            <SelectItem key={workspace.$id} value={workspace.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};