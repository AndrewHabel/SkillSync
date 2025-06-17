"use client";

import { GithubLoginCard } from "@/features/auth/components/github-login-card";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useState, useEffect } from "react";
import { useCurrent } from "@/features/auth/api/use-current";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberRole } from "@/features/members/types";
import { useRouter } from "next/navigation";

export default function GithubIntegrationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: user } = useCurrent();
  const workspaceId = useWorkspaceId();
  const { data: members } = useGetMembers({ workspaceId });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
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
      setIsLoading(false);
    } else if (members && user) {
      setIsLoading(false);
      setIsAdmin(false);
    }
  }, [members, user]);

  // Redirect non-admin users back to workspace
  useEffect(() => {
    if (!isLoading && isAdmin === false && workspaceId) {
      router.push(`/workspaces/${workspaceId}`);
    }
  }, [isAdmin, isLoading, router, workspaceId]);
  if (isLoading) {
    return <PageLoader />;
  }

  // If not admin, show access denied message (will be redirected by useEffect)
  if (isAdmin === false) {
    return <PageError message="Access denied. Only admins can access GitHub integration." />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <GithubLoginCard />
    </div>
  );
}