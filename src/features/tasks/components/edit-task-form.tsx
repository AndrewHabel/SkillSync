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
import { TaskStatus, Task, PreferredRole, getPreferredRoleDisplay, ExpertiseLevel, getExpertiseLevelDisplay } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-tasks";
import { Textarea } from "@/components/ui/textarea";


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
    resolver: zodResolver(createTaskSchema.omit({workspaceId : true})),
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
    <Card className="w-full h-full border-none shadow-none max-w-5xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>
                    Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the task in detail"
                        rows={4}
                        value={field.value || ''}
                      />
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
              <FormField 
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Estimated Hours
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Enter estimated hours to complete"
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="preferredRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    Preferred Role
                    </FormLabel>
                   <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Preferred Role"/>
                      </SelectTrigger>
                    </FormControl>
                    <FormMessage />
                    <SelectContent>
                      <SelectItem value={PreferredRole.DATA_ANALYST}>
                        {getPreferredRoleDisplay(PreferredRole.DATA_ANALYST)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.FRONTEND_DEVELOPER}>
                        {getPreferredRoleDisplay(PreferredRole.FRONTEND_DEVELOPER)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.SECURITY_SPECIALIST}>
                        {getPreferredRoleDisplay(PreferredRole.SECURITY_SPECIALIST)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.UI_DESIGNER}>
                        {getPreferredRoleDisplay(PreferredRole.UI_DESIGNER)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.PERFORMANCE_ENGINEER}>
                        {getPreferredRoleDisplay(PreferredRole.PERFORMANCE_ENGINEER)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.TESTER}>
                        {getPreferredRoleDisplay(PreferredRole.TESTER)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.BACKEND_DEVELOPER}>
                        {getPreferredRoleDisplay(PreferredRole.BACKEND_DEVELOPER)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.DATABASE_ADMINISTRATOR}>
                        {getPreferredRoleDisplay(PreferredRole.DATABASE_ADMINISTRATOR)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.DEVOPS_ENGINEER}>
                        {getPreferredRoleDisplay(PreferredRole.DEVOPS_ENGINEER)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.AI_SPECIALIST}>
                        {getPreferredRoleDisplay(PreferredRole.AI_SPECIALIST)}
                      </SelectItem>
                      <SelectItem value={PreferredRole.DATA_SCIENTIST}>
                        {getPreferredRoleDisplay(PreferredRole.DATA_SCIENTIST)}
                      </SelectItem>
                    </SelectContent>
                   </Select>
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="expertiseLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    Expertise Level Needed
                    </FormLabel>
                   <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Expertise Level"/>
                      </SelectTrigger>
                    </FormControl>
                    <FormMessage />
                    <SelectContent>
                      <SelectItem value={ExpertiseLevel.BEGINNER}>
                        {getExpertiseLevelDisplay(ExpertiseLevel.BEGINNER)}
                      </SelectItem>
                      <SelectItem value={ExpertiseLevel.INTERMEDIATE}>
                        {getExpertiseLevelDisplay(ExpertiseLevel.INTERMEDIATE)}
                      </SelectItem>
                      <SelectItem value={ExpertiseLevel.ADVANCED}>
                        {getExpertiseLevelDisplay(ExpertiseLevel.ADVANCED)}
                      </SelectItem>
                      <SelectItem value={ExpertiseLevel.EXPERT}>
                        {getExpertiseLevelDisplay(ExpertiseLevel.EXPERT)}
                      </SelectItem>
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