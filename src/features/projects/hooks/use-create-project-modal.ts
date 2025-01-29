import { set } from "date-fns";
import {useQueryState , parseAsBoolean} from "nuqs"

export const useCreateProjectModal = () => {
    const [isOpen , setIsOpen] = useQueryState('create_project',parseAsBoolean.withDefault(false).withOptions({clearOnDefault:true}));

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        open,
        close,
        setIsOpen
    }

}