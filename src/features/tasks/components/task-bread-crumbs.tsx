import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import {Project} from "@/features/projects/types";
import {Task} from "@/features/tasks/types";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ChevronRight, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useDeleteTask } from "../api/use-delete-tasks";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { is } from "date-fns/locale";

interface TaskBreadCrumbsProps {
    project:Project;
    task:Task;
};

export const TaskBreadCrumbs = ({project, task}:TaskBreadCrumbsProps) => {
    
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const {mutate,isPending} = useDeleteTask();
    const [ConfirmDialog, confirm] = useConfirm(
        "Delete Task ?",
        "This action cannot be undone",
        "destructive"
    );
    
    const handleDelete = async () => {
        const ok = await confirm();
        if(!ok) return;

        mutate({ param: { taskId: task.$id }}, {
        onSuccess: () => {
            router.push(`/workspaces/${workspaceId}/tasks`);
        },
        });

    };

    return(
        <div className="flex items-center gap-x-2">
            <ConfirmDialog />
            <ProjectAvatar name={project.name} image={project.imageUrl} className="size- lg:size-8" />
            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">{project.name}</p>
            </Link>
            <ChevronRight className="size-4 lg:size-5 text-muted-foreground" />
            <p className="text-sm lg:text-lg font-semibold">
                {task.name}
            </p>
            <Button onClick={handleDelete} disabled={isPending} className="ml-auto" variant="destructive" size="sm">
                
                <TrashIcon className="size-4 lg:mr-2"/>
                <span className="hidden lg:block">Delete Task</span>
            </Button>
        </div>
    );
};