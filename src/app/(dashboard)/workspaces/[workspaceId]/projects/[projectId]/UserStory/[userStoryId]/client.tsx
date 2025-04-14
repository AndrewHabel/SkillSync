"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetStory } from "@/features/UserStories/api/use-get-story";
import { StoryAcceptance } from "@/features/UserStories/components/story-acceptance";
import { StoryBreadCrumbs } from "@/features/UserStories/components/story-bread-crumbs";
import { StoryDescription } from "@/features/UserStories/components/story-description";
import { StoryTaskGenerator } from "@/features/UserStories/components/story-task-generator";
import { useStoryId } from "@/features/UserStories/hooks/use-story-id";

export const UserStoryIdClient = () => {
    const storyId = useStoryId();
    const projectId = useProjectId();
    const {data:userStory, isLoading:lodingUserStory} = useGetStory({storyId});
    const {data:project ,isLoading:lodingProject} = useGetProject({projectId: projectId});

    if(lodingUserStory || lodingProject) return <PageLoader />;
    if(!userStory) return <PageError message="User Story Not Found"/>;
    
    return (
        <div className="flex flex-col">
            <StoryBreadCrumbs story={userStory} project={project} />
            <DottedSeparator className="my-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <StoryDescription userStory={userStory} />
                <StoryAcceptance userStory={userStory} />
            </div>
            <StoryTaskGenerator userStory={userStory} />
        </div>
    )
}