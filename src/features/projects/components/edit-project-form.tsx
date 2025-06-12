"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UpdateProjectSchema } from "../schema";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, ImageIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";
import { useUpdateProject } from "../api/use-update-project";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProject } from "../api/use-delete-project";
import { TechStackSelector } from "./tech-stack-selector";
import { Badge } from "@/components/ui/badge";


interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues: Project;
}

export const EditProjectForm = ({ onCancel, initialValues}: EditProjectFormProps) => {
  const router = useRouter();
  const {mutate, isPending} = useUpdateProject();
  const {mutate: deleteProject, isPending: isDeleteingProject} = useDeleteProject();
  const [DeleteConfirmationDialog, confirmDelete] = useConfirm("Delete project", "Are you sure you want to delete this Project?", "destructive");
  const inputRef = useRef<HTMLInputElement>(null);
  const [techSelectorOpen, setTechSelectorOpen] = useState(false);

  // Parse the initial tech stack from string to array if needed
  const initialTechStack = initialValues.ProjectTechStack 
    ? typeof initialValues.ProjectTechStack === 'string'
      ? initialValues.ProjectTechStack.split(',').map(tech => tech.trim())
      : initialValues.ProjectTechStack
    : [];

  const form = useForm<z.infer<typeof UpdateProjectSchema>>({
    resolver: zodResolver(UpdateProjectSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",
      ProjectTechStack: initialTechStack,
    },
  });

  const onSubmit = (values: z.infer<typeof UpdateProjectSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
      ProjectTechStack: Array.isArray(values.ProjectTechStack) 
        ? values.ProjectTechStack.join(",") 
        : values.ProjectTechStack,
    };
    
    mutate({ form: finalValues, param: {projectId: initialValues.$id}});
  };

  const handelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) { 
      form.setValue("image", file);
    }
  };

  // Handle tech stack selection
  const handleTechStackSelection = (selected: string[]) => {
    form.setValue("ProjectTechStack", selected);
  };

  const handelDelete = async () => {
    const ok = await confirmDelete();
    if(!ok) return;
    deleteProject({param: {projectId: initialValues.$id}}, {
      onSuccess: () => {
        window.location.href = `/workspaces/${initialValues.workspaceId}`;
      }
    });
  };

  // Get the current selected tech stack
  const selectedTechStack = form.watch("ProjectTechStack") || [];

  return(
    <div className="flex flex-col gap-y-4 bg-slate-300 dark:bg-slate-900 rounded-md p-4">
      <DeleteConfirmationDialog />
   
      <Card className="w-full h-full border-none shadow-none bg-slate-300 dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}>
            <ArrowLeftIcon className="size-4px mr-2" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
          </CardTitle>
        </CardHeader>      
      </Card>

      <Card className="w-full h-full border-none shadow-none bg-slate-300 dark:bg-slate-900">
      <CardContent className="p-7">
      <div className="flex flex-col">
            <h3 className="font-bold">Edit Project</h3>
            <p className="text-sm text-muted-foreground">
            </p>
            <DottedSeparator className="py-7" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Project name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project Description
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Add a description about your project (goals, objectives, etc.)" 
                        className="resize-none min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ProjectTechStack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Tech Stack</FormLabel>
                    <div className="flex flex-col gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setTechSelectorOpen(true)}
                        className="flex justify-between w-full"
                      >
                        <span className={cn(field.value?.length === 0 && "text-muted-foreground")}>
                          {field.value?.length > 0 
                            ? `${field.value.length} technologies selected` 
                            : "Select technologies for your project"}
                        </span>
                        <Plus size={16} />
                      </Button>
                      
                      {field.value?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {field.value.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <TechStackSelector
                        open={techSelectorOpen}
                        onOpenChange={setTechSelectorOpen}
                        selectedTech={field.value || []}
                        onSelect={handleTechStackSelection}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                          <div className="size-[72px] relative rounded-md overflow-hidden">
                            <Image
                              alt="Logo"
                              fill
                              className="object-cover" 
                              src={
                                field.value instanceof File
                                ? URL.createObjectURL(field.value)
                                : field.value
                              }
                            />
                          </div>
                        ) : (
                          <Avatar className="size-[72px]">
                            <AvatarFallback>
                              <ImageIcon className="size-[36px] text-neutral-400" />
                            </AvatarFallback>
                          </Avatar>
                        )
                      }
                      <div className="flex flex-col">
                        <p className="text-sm">Project Icon</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG & max 1MB</p>
                        <Input 
                          className="hidden"
                          type="file"
                          accept=".jpg, .png, .svg, .jpeg"
                          ref={inputRef}
                          onChange={handelImageChange}
                          disabled={isPending}
                        />
                        {
                          field.value ? (
                            <Button type="button" disabled={isPending} variant="destructive" size="xs" className="w-fit mt-2" onClick={() => {
                              field.onChange(null);
                              if(inputRef.current) {
                                inputRef.current.value = "";
                              }
                            }} >
                              remove Image
                            </Button>
                          ):(
                            <Button type="button" disabled={isPending} variant="teritary" size="xs" className="w-fit mt-2" onClick={() => inputRef.current?.click()} >
                              Upload Image
                            </Button>
                          )
                        }
                      </div>
                    </div>
                  </div>
                )} 
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
                <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                  Save Changes
                </Button>
            </div>
          </form>
        </Form>
      </div>
      </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none bg-slate-300 dark:bg-slate-900">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Delete Workspace</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a project is irreversible. All associated data will be lost.
            </p> 
            <DottedSeparator className="py-7" />
            <Button className="mt-6 w-fit ml-auto" size="sm" variant="destructive" type="button" disabled={isPending || isDeleteingProject} onClick={handelDelete}>
              Delete Project
            </Button>
          </div>
        </CardContent>       
      </Card>
      
  </div>
  )
};