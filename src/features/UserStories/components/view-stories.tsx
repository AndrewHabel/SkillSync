"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetStories } from "@/features/UserStories/api/use-get-stories";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateStoryModal } from "../hooks/use-create-story-modal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; 

import { PlusIcon } from "lucide-react";
import { ArrowLeftIcon } from "lucide-react";
import { PencilIcon } from "lucide-react";
import { CreateStoryForm } from "./create-story-form";

export const ViewStories = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const router = useRouter();

  const { data: initialValues, isLoading } = useGetProject({ projectId });
  const { data: userStories, isLoading: loadingStories } = useGetStories({ projectId, workspaceId });

  const { open } = useCreateStoryModal();

  if (isLoading || loadingStories) return <PageLoader />;
  if (!initialValues) return <PageError message="Project not found" />;

  return (
    <div className="min-h-screen px-4 py-6">
      <Button variant="secondary" size="sm" asChild className="mb-4">
        <Link href={`/workspaces/${workspaceId}/projects/${projectId}`}>
          <ArrowLeftIcon className="size-4 mr-2" />
          Back
        </Link>
      </Button>

      <div className="max-w-6xl mx-auto bg-card rounded-xl shadow p-6 border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">User Stories</h2>
          <Button onClick={open} className="w-full lg:w-auto px-4 py-2" size="sm">
            <PlusIcon className="size-4 mr-2" />
            New
          </Button>
        </div>

        <div className="space-y-4">
          {userStories?.documents.map((story) => (
            <div
              key={story.$id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 border p-4 rounded-md bg-accent hover:bg-accent/80 transition-colors"
            >
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">{story.description}</p>
                <p className="text-sm text-muted-foreground">{story.AcceptanceCriteria}</p>
              </div>
              <Button variant="solid" className="w-full md:w-auto px-4 py-2 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                <Link href={`/workspaces/${workspaceId}/projects/${projectId}/UserStory/${story.$id}`} className="flex items-center">
                  <PencilIcon className="size-4 mr-2" />
                  Manage
                </Link>
              </Button>
            </div>
          ))}
          {userStories?.documents.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">
              No user stories found. Create your first one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
