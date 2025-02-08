"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UpdateProjectSchema } from "../schema";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";
import { useUpdateProject } from "../api/use-update-project";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProject } from "../api/use-delete-project";


interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues:Project;
}

export const EditProjectForm = ({ onCancel , initialValues}: EditProjectFormProps) => {

  const router = useRouter();

  const {mutate, isPending} = useUpdateProject();

  const {mutate:deleteProject, 
   isPending:isDeleteingProject} = useDeleteProject();

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm("Delete project", "Are you sure you want to delete this Project?", "destructive");

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof UpdateProjectSchema>>({
    resolver: zodResolver(UpdateProjectSchema),
    defaultValues: {
      ...initialValues,
      image:initialValues.imageUrl ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof UpdateProjectSchema> ) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    } 
    mutate({ form: finalValues , param:{projectId:initialValues.$id}}, {
     
    });
  };

  const handelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) { 
      form.setValue("image", file)
    }
  }

  const handelDelete = async () => {
    const ok = await confirmDelete();
    if(!ok) return;
    deleteProject({param : {projectId:initialValues.$id},}, {
      onSuccess: () => {
        window.location.href = `/workspaces/${initialValues.workspaceId}`;
      }
    });
  };

  return(
    <div className="flex flex-col gap-y-4">
      <DeleteConfirmationDialog />
   
      <Card className="w-full h-full border-none shadow-none">
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

      <Card className="w-full h-full border-none shadow-none">
      <CardContent className="p-7">
      <div className="flex flex-col">
            <h3 className="font-bold">Edit Project</h3>
            <p className="text-sm text-muted-foreground">
            </p>
            <DottedSeparator className="py-7" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField 
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

      <Card className="w-full h-full border-none shadow-none">
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