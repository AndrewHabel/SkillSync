import {useQueryState, parseAsString} from "nuqs"

export const useEditStoryModal = () => {
    const [storyId, setStoryId] = useQueryState("edit_story", parseAsString);
    
    const open = (id: string) => setStoryId(id);
    const close = () => setStoryId(null);

    return {
        storyId,
        open,
        close,
        setStoryId
    }
}