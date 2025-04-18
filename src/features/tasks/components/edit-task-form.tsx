"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTaskSchema } from "../schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";;
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectValue ,SelectTrigger, SelectContent , SelectItem} from "@/components/ui/select";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { TaskStatus, Task } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-tasks";


interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: {id: string, name: string , imageUrl:string}[];
  memberOptions: {id: string, name: string }[];
  initialValues: Task;
}

export const EditTaskForm = ({ onCancel , projectOptions , memberOptions, initialValues}: EditTaskFormProps) => {

  const {mutate, isPending} = useUpdateTask();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema.omit({workspaceId : true, description: true,})),
    defaultValues: {
      ...initialValues,
      dueDate: initialValues.dueDate? new Date(initialValues.dueDate) : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof createTaskSchema> ) => {

    const selectedProject = projectOptions.find(project => project.id === values.projectId);
    const selectedAssignee = memberOptions.find(member => member.id === values.assigneeId);
    
    const submissionData = {
      ...values,
      projectName: selectedProject?.name || '',
      assigneeName: selectedAssignee?.name || '',
    };
    
    mutate({ json: submissionData, param: { taskId: initialValues.$id }}, {
      onSuccess: ({ data }) => {
        form.reset();
        onCancel?.();
      }
    });
  };

  return(
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Edit Task!
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    Task Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Task name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    Due Date
                    </FormLabel>
                    <FormControl>
                      <DatePicker {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    Assignee
                    </FormLabel>
                   <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Assignee"/>
                      </SelectTrigger>
                    </FormControl>
                    <FormMessage />
                    <SelectContent>
                      {memberOptions.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-x-2">
                            <MembersAvatar className="size-6" name={member.name}/>
                            {member.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                   </Select>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    Status
                    </FormLabel>
                   <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status"/>
                      </SelectTrigger>
                    </FormControl>
                    <FormMessage />
                    <SelectContent>
                      <SelectItem value={TaskStatus.BACKLOG}>
                        Backlog
                      </SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>
                        In Progress
                      </SelectItem>
                      <SelectItem value={TaskStatus.IN_REVIEW}>
                        In Review
                      </SelectItem>
                      <SelectItem value={TaskStatus.TODO}>
                        To Do
                      </SelectItem>
                      <SelectItem value={TaskStatus.DONE}>
                        Done
                      </SelectItem>
                    </SelectContent>
                   </Select>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project
                    </FormLabel>
                   <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project"/>
                      </SelectTrigger>
                    </FormControl>
                    <FormMessage />
                    <SelectContent>
                      {projectOptions.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-x-2">
                            <ProjectAvatar className="size-6" name={project.name} image={project.imageUrl}/>
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                   </Select>
                  </FormItem>
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
      </CardContent>
    </Card>
  )
} ;