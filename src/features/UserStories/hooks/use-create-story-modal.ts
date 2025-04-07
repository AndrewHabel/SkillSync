import {useQueryState , parseAsBoolean} from "nuqs"

export const useCreateStoryModal = () => {
    const [isOpen , setIsOpen] = useQueryState('create_story',parseAsBoolean.withDefault(false).withOptions({clearOnDefault:true}));

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        open,
        close,
        setIsOpen
    }
}
