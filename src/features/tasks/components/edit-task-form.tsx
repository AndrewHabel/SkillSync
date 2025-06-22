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
import { Loader2, LinkIcon } from "lucide-react";
import { useGetAllTaskDependencies } from "@/features/TasksDependencies/api/use-get-tasks-dependencies";
// Custom scrollbar styles will be applied using Tailwind classes

interface EditTaskFormProps {
  onCancel?: () => void;
  projectOptions: {id: string, name: string , imageUrl:string}[];
  memberOptions: {id: string, name: string }[];
  initialValues: Task;
  taskDependencies?: Array<{
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    dependReason?: string;
    dependOnTaskName?: string;
    taskId?: string;
    dependOnTaskId?: string;
    [key: string]: any;  // For any additional properties
  }>;
}

export const EditTaskForm = ({ onCancel , projectOptions , memberOptions,taskDependencies,initialValues}: EditTaskFormProps) => {

  const {mutate, isPending} = useUpdateTask();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema.omit({workspaceId : true})),
    defaultValues: {
      ...initialValues,
      dueDate: initialValues.dueDate? new Date(initialValues.dueDate) : undefined,
    },
  });

  console.log("aethntrhsbrthbsrthrtnbsgnrthbsrtbsnfgn", taskDependencies);

  const onSubmit = (values: z.infer<typeof createTaskSchema> ) => {
    const selectedProject = projectOptions.find(project => project.id === values.projectId);
    
    // Handle special "unassigned" value for assigneeId
    const assigneeId = values.assigneeId ? undefined : values.assigneeId;
    const selectedAssignee = assigneeId 
      ? memberOptions.find(member => member.id === assigneeId)
      : undefined;
      
    // Handle special values for preferred role and expertise level
    const preferredRole = values.preferredRole ? undefined : values.preferredRole;
    const expertiseLevel = values.expertiseLevel ? undefined : values.expertiseLevel;
      
    // Process values to handle optional fields correctly
    const submissionData = {
      ...values,
      assigneeId: assigneeId || '',
      preferredRole,
      expertiseLevel,
      projectName: selectedProject?.name || '',
      // Only include assigneeName if assigneeId is provided
      ...(selectedAssignee ? { assigneeName: selectedAssignee?.name || '' } : { assigneeName: '' }),
    };
    
    mutate({ json: submissionData, param: { taskId: initialValues.$id }}, {
      onSuccess: ({ data }) => {
        form.reset();
        onCancel?.();
      }
    });
  };  return(
    <Card className="w-full h-full border-none shadow-none max-w-10xl mx-auto">
      <CardHeader className="flex p-12">
        <CardTitle className="text-xl font-bold">
          Edit Task
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
              {/* Main form content - takes 8 columns on md screens */}
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* First column with basic task info */}
                <div className="space-y-4">
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe the task in detail"
                            rows={3}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
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
                
                {/* Second column with assignment and expertise info */}
                <div className="space-y-4">
                  <FormField 
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Assignee (optional)
                        </FormLabel>
                        <Select 
                          defaultValue={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Assignee"/>
                            </SelectTrigger>
                          </FormControl>
                          <FormMessage />                          <SelectContent>
                            <SelectItem value="unassigned">
                              <div className="flex items-center gap-x-2 text-muted-foreground">
                                None (Unassigned)
                              </div>
                            </SelectItem>
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
                    name="preferredRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Preferred Role (optional)
                        </FormLabel>
                        <Select 
                          defaultValue={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Preferred Role"/>
                            </SelectTrigger>
                          </FormControl>
                          <FormMessage />                          <SelectContent>
                            <SelectItem value="none_role">
                              <div className="text-muted-foreground">
                                None (No specific role required)
                              </div>
                            </SelectItem>
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
                          Expertise Level Needed (optional)
                        </FormLabel>
                        <Select 
                          defaultValue={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Expertise Level"/>
                            </SelectTrigger>
                          </FormControl>
                          <FormMessage />                          <SelectContent>
                            <SelectItem value="none_expertise">
                              <div className="text-muted-foreground">
                                None (No specific expertise level required)
                              </div>
                            </SelectItem>
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
                  <FormField 
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Estimated Hours (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
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
                </div>
              </div>
              
              {/* Task Dependencies Section - takes 4 columns on md screens */}
              <div className="md:col-span-4">
                {taskDependencies && taskDependencies.length > 0 && (
                  <div className="h-full">
                    <h3 className="text-lg font-semibold mb-4">Task Dependencies</h3>
                    <div className="max-h-[500px] overflow-y-auto pr-2" style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'var(--muted) transparent'
                    }}>
                      <div className="space-y-3">
                        {taskDependencies.map((dependency) => (
                          <div 
                            key={dependency.$id} 
                            className="border rounded-md p-4 bg-muted/30"
                          >
                            <div className="flex items-start gap-2">
                              <LinkIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {dependency.dependOnTaskName || "Dependent Task"}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {dependency.dependReason || "No reason provided"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>            </div>
            
            <div className="col-span-12">
              <DottedSeparator className="py-7" />
            </div><div className="md:col-span-12 flex items-center justify-between">
              <Button 
                type="button" 
                size="lg" 
                variant="secondary" 
                onClick={onCancel} 
                disabled={isPending} 
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="lg" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
};