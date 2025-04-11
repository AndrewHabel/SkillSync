"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetStory } from "@/features/UserStories/api/use-get-story";
import { StoryAcceptance } from "@/features/UserStories/components/story-acceptance";
import { StoryBreadCrumbs } from "@/features/UserStories/components/story-bread-crumbs";
import { StoryDescription } from "@/features/UserStories/components/story-description";
import { useStoryId } from "@/features/UserStories/hooks/use-story-id";

export const UserStoryIdClient = () => {
    const storyId = useStoryId();
    const {data, isLoading} = useGetStory({storyId});
    console.log(data);

    if(isLoading) return <PageLoader />;
    if(!data) return <PageError message="User Story Not Found"/>;
    
    return (
        <div className="flex flex-col">
            <StoryBreadCrumbs project={data.project} story={data} />
            <DottedSeparator className="my-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <StoryDescription userStory={data} />
                <StoryAcceptance userStory={data} />
            </div>
        </div>
    )
}