import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import {Project} from "@/features/projects/types";
import { UserStory } from "@/features/UserStories/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ChevronRight, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useDeleteStory } from "../api/use-delete-story";
import { useConfirm } from "@/hooks/use-confirm"
import { useRouter } from "next/navigation";

interface StoryBreadCrumbsProps {
    project: any;
    story: UserStory;
}

export const StoryBreadCrumbs = ({project, story}: StoryBreadCrumbsProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const {mutate, isPending} = useDeleteStory();
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete User Story ?",
        "This action cannot be undone",
        "destructive"
    );

    const handleDelete = async () => {
        const ok = await confirm();
        if(!ok) return;

        mutate({param: {userStoryId: story.$id}}, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/projects/${project.$id}/UserStory`);
            }
        });
    };

    return (
      <div className="flex items-center gap-x-2">
        <ConfirmDialog />
        <ProjectAvatar name={project.name} image={project.imageUrl} className="size- lg:size-8" />
        <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
            <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">{project.name}</p>
        </Link>
        <ChevronRight className="size-4 lg:size-5 text-muted-foreground" />
        <p className="text-sm lg:text-lg font-semibold">
          {story.name}
        </p>
        <Button onClick={handleDelete} disabled={isPending} className="ml-auto" variant="destructive" size="sm">
          <TrashIcon className="size-4 lg:mr-2"/>
          <span className="hidden lg:block">Delete User Story</span>
        </Button>
      </div>
    )   
}



