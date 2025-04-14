import { Button } from "@/components/ui/button";
import {UserStory} from "../types";
import { PencilIcon, XIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateStory } from "../api/use-update-story";

interface StoryDescriptionPrps{
  userStory: UserStory; 
};

export const StoryDescription = ({userStory}: StoryDescriptionPrps) => {

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(userStory.description);
  const {mutate, isPending} = useUpdateStory();

  const handleSave = () => {
    mutate({
      json: {description: value},
      param: {userStoryId: userStory.$id}
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold text-foreground">User Story Description</p>
        <Button onClick={() => setIsEditing((prev)=>!prev)} size="sm" variant="secondary">
          {isEditing? (
            <XIcon className="size-4 mr-2" />
          ):(
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing? "Cancel": "Edit"}

        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing? (
        <div className="flex flex-col gap-y-4">
          <Textarea placeholder="Add a description" value={value} rows={4} onChange={(e)=>setValue(e.target.value)} disabled={isPending}/>
          <Button size="sm" className="w-fit ml-auto" onClick={handleSave} disabled={isPending}>
            {isPending? "Saving...": "Save changes"}
          </Button>
        </div>
      ):(
        <div className="text-foreground">
          {userStory.description || (
            <span className="text-muted-foreground">No Description</span>
          )}
        </div>
      )}
    </div>
  )
}
