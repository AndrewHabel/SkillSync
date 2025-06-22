import {useMedia} from 'react-use';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Drawer , DrawerContent} from '@/components/ui/drawer';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ResponsiveModalProps {
    children: React.ReactNode;
    open: boolean;
    onopenchange: (open: boolean) => void;
    title?: string;
    description?: string;
}

export const ResponsiveModal = ({
    children,
    open,
    onopenchange,
    title = "Dialog Content", // Default title for accessibility
    description = "Content for dialog interaction" // Default description for accessibility
}:ResponsiveModalProps) => {
    const isDesktop = useMedia('(min-width: 1024px)',true);
    if(isDesktop){        return (
            <Dialog open={open} onOpenChange={onopenchange}>                <DialogContent className='w-full sm:max-w-[70vw] p-0 border-none overflow-y-auto hide-scrollbar ma-h-[85vh]'>
                    <DialogHeader>
                        <VisuallyHidden>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription>{description}</DialogDescription>
                        </VisuallyHidden>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        );
    };    return (
        <Drawer open={open} onOpenChange={onopenchange}>
            <DrawerContent>
                {/* For drawer, we don't need DialogTitle, but we can add an aria-label */}
                <div 
                    className='overflow-y-auto hide-scrollbar ma-h-[85vh]'                    aria-label={title}
                    aria-description={description}
                >
                    {children}
                </div>
            </DrawerContent>
        </Drawer>
    );
};