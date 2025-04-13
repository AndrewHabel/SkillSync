"use client";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import Link from "next/link";
import { RiAddCircleFill } from "react-icons/ri";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

export const Projects = () => {
    const pathname = usePathname();
    const {open} =  useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    const {data} = useGetProjects({workspaceId});

    return (
        <div className="flex flex-col gap-y-2">
              <div className=" flex items-center justify-between">
                <p className="text-xs uppercase text-primary font-semibold ">Projects</p>
                <RiAddCircleFill onClick={open} className="size-5 text-primary cursor-pointer hover:opacity-75 transition " />
              </div>
              {data?.documents.map((project) => {
                const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
                const isActive = pathname === href;
                return (
                  <Link href={href} key={project.$id}>
                    <div className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-md font-medium transition-all duration-300 ease-in-out group text-muted-foreground hover:text-primary hover:bg-accent",
                        isActive && "bg-card shadow-sm hover:opacity-100 text-primary"
                    )}>
                        <ProjectAvatar image={project.imageUrl} name={project.name} className="group-hover:scale-110" />
                        <span className="truncate group-hover:translate-x-2 transition-transform duration-300">{project.name}</span>
                    </div>
                  </Link>
                );
              })}
        </div>
    );

};