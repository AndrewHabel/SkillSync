import { useQueryState, parseAsBoolean } from "nuqs"

export const useInviteUserModal = () => {
    const [isOpen, setIsOpen] = useQueryState('invite_user', parseAsBoolean.withDefault(false).withOptions({clearOnDefault:true}));

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        open,
        close,
        setIsOpen
    }
}