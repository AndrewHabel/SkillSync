import{
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

import { useDeleteTask } from "../api/use-delete-tasks";
import { useConfirm } from "@/hooks/use-confirm";

interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
};


export const TaskActions = ({ id, projectId, children }: TaskActionsProps) => {

    const [ConfirmDialog,confirm] = useConfirm(
        "Are you sure you want to delete this task?",
        "This Action cannot be undone",
        "destructive"
    );

    const {mutate,isPending} = useDeleteTask();

    const handleDelete = async () => {
        const ok = await confirm();
        if(!ok) return;
        mutate({param: {taskId: id}});
    };

    return(
        <div className="flex justify-end">
            <ConfirmDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={()=>{}} disabled={false} className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>{}} disabled={false} className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>{}} disabled={false} className="font-medium p-[10px]">
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-amber-700 focus:text-amber-700 font-medium p-[10px]">
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};