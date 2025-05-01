"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTaskSchema } from "../schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTask } from "../api/use-create-tasks";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Textarea } from "@/components/ui/textarea";
import { ExpertiseLevel, PreferredRole, TaskStatus } from "../types";
import { Loader2, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTaskInfoGeneration, GeneratedTaskInfo } from "@/features/TaskInfoGeneration/api/use-task-info-generation";

interface CreateTaskFormProps {
  onCancel?: () => void;
  projectOptions: {id: string, name: string, imageUrl: string}[];
  memberOptions: {id: string, name: string}[];
}

export const CreateTaskForm = ({ onCancel, projectOptions }: CreateTaskFormProps) => {

  const workspaceId = useWorkspaceId();
  const {mutate, isPending} = useCreateTask();
  const [isGenerating, setIsGenerating] = useState(false);
  const { mutate: generateTaskInfo, isPending: isGeneratingTaskInfo } = useTaskInfoGeneration();

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema.omit({workspaceId: true})),
    defaultValues: {
      workspaceId,
      status: TaskStatus.TODO,
    },
  });

  // Get the task name and description values for AI generation
  const taskName = form.watch('name') || '';
  const taskDescription = form.watch('description') || '';

  const handleGenerateTaskInfo = () => {
    if (!taskName || !taskDescription) {
      return;
    }

    setIsGenerating(true);
    const userInput = `${taskName}\n${taskDescription}`;

    generateTaskInfo(
      { json: { userInput } },
      {
        onSuccess: (data) => {
          try {
            // Extract JSON from the response
            const jsonText = data.data.response;
            const generatedInfo = JSON.parse(jsonText.replace(/```json|```/g, '').trim());

            // Map preferred role string to enum
            if (generatedInfo.preferredRole) {
              const roleMapping: Record<string, PreferredRole> = {
                "Data Analyst": PreferredRole.DATA_ANALYST,
                "Frontend Developer": PreferredRole.FRONTEND_DEVELOPER,
                "Security Specialist": PreferredRole.SECURITY_SPECIALIST,
                "UI Designer": PreferredRole.UI_DESIGNER,
                "Performance Engineer": PreferredRole.PERFORMANCE_ENGINEER,
                "Tester": PreferredRole.TESTER,
                "Backend Developer": PreferredRole.BACKEND_DEVELOPER,
                "Database Administrator": PreferredRole.DATABASE_ADMINISTRATOR,
                "DevOps Engineer": PreferredRole.DEVOPS_ENGINEER,
                "AI Specialist": PreferredRole.AI_SPECIALIST,
                "Data Scientist": PreferredRole.DATA_SCIENTIST,
              };
              
              const preferredRole = roleMapping[generatedInfo.preferredRole] || 
                Object.values(PreferredRole).find(role => 
                  role.toLowerCase().includes(generatedInfo.preferredRole.toLowerCase().replace(/\s+/g, '_'))
                );
              
              if (preferredRole) {
                form.setValue('preferredRole', preferredRole);
              }
            }

            // Map expertise level string to enum
            if (generatedInfo.expertiseLevel) {
              const expertiseMapping: Record<string, ExpertiseLevel> = {
                "BEGINNER": ExpertiseLevel.BEGINNER,
                "INTERMEDIATE": ExpertiseLevel.INTERMEDIATE,
                "ADVANCED": ExpertiseLevel.ADVANCED,
                "EXPERT": ExpertiseLevel.EXPERT
              };
              
              const expertiseLevel = expertiseMapping[generatedInfo.expertiseLevel] || 
                Object.values(ExpertiseLevel).find(level => 
                  level.toLowerCase() === generatedInfo.expertiseLevel.toLowerCase()
                );
              
              if (expertiseLevel) {
                form.setValue('expertiseLevel', expertiseLevel);
              }
            }

            // Set estimated hours
            if (generatedInfo.estimatedHours) {
              form.setValue('estimatedHours', generatedInfo.estimatedHours);
            }

            setIsGenerating(false);

          } catch (error) {
            console.error("Error parsing AI response:", error);
            console.log("Raw response:", data.data.response);
            setIsGenerating(false);
          }
        },
        onError: () => {
          setIsGenerating(false);
        }
      }
    );
  };

  const onSubmit = (values: z.infer<typeof createTaskSchema>) => {
    mutate({ json: {...values, workspaceId} }, {
      onSuccess: () => {
        form.reset();
        onCancel?.();
      }
    });
  };

  return (
    <Card className="w-full h-full border-none shadow-none max-w-5xl mx-auto">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new Task!
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* First column of form fields */}
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
                          <SelectItem value={TaskStatus.TODO}>
                            To Do
                          </SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>
                            In Progress
                          </SelectItem>
                          <SelectItem value={TaskStatus.IN_REVIEW}>
                            In Review
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

              {/* Second column with AI-generated fields */}
              <div className="space-y-4 flex flex-col">
                {/* Generate button for AI at the top of second column */}
                <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 mb-4">
                  <h3 className="text-sm font-medium mb-2">AI Assistance</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Enter task name and description, then let AI suggest role, expertise level and estimated hours.
                  </p>
                  <Button 
                    type="button"
                    onClick={handleGenerateTaskInfo}
                    disabled={isGeneratingTaskInfo || !taskName || !taskDescription}
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700"
                  >
                    {isGeneratingTaskInfo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 h-4 w-4" />
                        Generate Task Details
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="mt-2 flex justify-center">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        Processing...
                      </Badge>
                    </div>
                  )}
                </div>

                {/* AI-generated fields */}
                <FormField 
                  control={form.control}
                  name="preferredRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Preferred Role
                      </FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Preferred Role"/>
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          <SelectItem value={PreferredRole.DATA_ANALYST}>
                            Data Analyst
                          </SelectItem>
                          <SelectItem value={PreferredRole.FRONTEND_DEVELOPER}>
                            Frontend Developer
                          </SelectItem>
                          <SelectItem value={PreferredRole.SECURITY_SPECIALIST}>
                            Security Specialist
                          </SelectItem>
                          <SelectItem value={PreferredRole.UI_DESIGNER}>
                            UI Designer
                          </SelectItem>
                          <SelectItem value={PreferredRole.PERFORMANCE_ENGINEER}>
                            Performance Engineer
                          </SelectItem>
                          <SelectItem value={PreferredRole.TESTER}>
                            Tester
                          </SelectItem>
                          <SelectItem value={PreferredRole.BACKEND_DEVELOPER}>
                            Backend Developer
                          </SelectItem>
                          <SelectItem value={PreferredRole.DATABASE_ADMINISTRATOR}>
                            Database Administrator
                          </SelectItem>
                          <SelectItem value={PreferredRole.DEVOPS_ENGINEER}>
                            DevOps Engineer
                          </SelectItem>
                          <SelectItem value={PreferredRole.AI_SPECIALIST}>
                            AI Specialist
                          </SelectItem>
                          <SelectItem value={PreferredRole.DATA_SCIENTIST}>
                            Data Scientist
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
                        Expertise Level
                      </FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Expertise Level"/>
                          </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          <SelectItem value={ExpertiseLevel.BEGINNER}>
                            Beginner
                          </SelectItem>
                          <SelectItem value={ExpertiseLevel.INTERMEDIATE}>
                            Intermediate
                          </SelectItem>
                          <SelectItem value={ExpertiseLevel.ADVANCED}>
                            Advanced
                          </SelectItem>
                          <SelectItem value={ExpertiseLevel.EXPERT}>
                            Expert
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
                        Estimated Hours
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
                
                {/* Push the buttons to the bottom using flex-grow */}
                <div className="flex-grow"></div>
              </div>
            </div>
            
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
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
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
};