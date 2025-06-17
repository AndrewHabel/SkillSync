import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useTaskGeneration } from "@/features/taskgeneration/api/use-task-generation";
import { Separator } from "@/components/ui/separator";
import { 
  SparklesIcon, 
  Loader2, 
  ChevronUpIcon, 
  PencilIcon, 
  XIcon, 
  CheckIcon, 
  RocketIcon,
  ListTodoIcon,
  PlusCircleIcon,
  CheckCircle2Icon
} from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { UserStory } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBulkCreateTasks } from "@/features/tasks/api/use-bulk-create-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PreferredRole, TaskStatus, getPreferredRoleDisplay } from "@/features/tasks/types";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole } from "@/features/members/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Helper function to map role strings to string values acceptable for preferredRole
const mapRoleToPreferredRole = (roleString: string | null | undefined): string | undefined => {
  if (!roleString) return undefined;
  
  // Remove any spaces and convert to uppercase to match the enum format
  const formattedRole = roleString.replace(/\s+/g, '_').toUpperCase();
  
  // Check if the formatted role exists in the PreferredRole enum
  if (Object.values(PreferredRole).includes(formattedRole as PreferredRole)) {
    return formattedRole;
  }
  
  // Handle common cases that might not exactly match the enum
  switch (formattedRole) {
    case 'FRONTEND_DEV':
    case 'FRONT_END_DEVELOPER':
      return PreferredRole.FRONTEND_DEVELOPER;
    case 'BACKEND_DEV':
    case 'BACK_END_DEVELOPER':
      return PreferredRole.BACKEND_DEVELOPER;
    case 'UI_DESIGN':
      return PreferredRole.UI_DESIGNER;
    case 'QA':
    case 'QUALITY_ASSURANCE':
      return PreferredRole.TESTER;
    case 'DBA':
    case 'DATABASE_ADMIN':
      return PreferredRole.DATABASE_ADMINISTRATOR;
    case 'DEVOPS':
      return PreferredRole.DEVOPS_ENGINEER;
    case 'AI_ENGINEER':
      return PreferredRole.AI_SPECIALIST;
    default:
      return undefined;
  }
};

interface StoryTaskGeneratorProps {
  userStory: UserStory;
}

interface GeneratedTasks {
  "Task Titles": string[];
  "Task description": string[];
  "Task Roles": string[];
  "Experience Level": string[]; // Optional field for experience level
  "Estimated Time": string[]; // Optional field for estimated time
}

export const StoryTaskGenerator = ({ userStory }: StoryTaskGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTasks | null>(null);
  const { mutate, isPending } = useTaskGeneration();
  const { mutate: bulkCreateTasks, isPending: isAddingTasks } = useBulkCreateTasks();
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedExperienceLevel, setExperienceLevel] = useState("");
  const [editedEstimatedTime, setEditedEstimatedTime] = useState("");
  const [editedRole, setEditedRole] = useState<string | null>(null);
  // Track the added task indices
  const [addedTaskIndices, setAddedTaskIndices] = useState<Set<number>>(new Set());
  // Track loading state for individual task additions
  const [addingTaskIndex, setAddingTaskIndex] = useState<number | null>(null);
  
  // Get necessary context data
  const workspaceId = useWorkspaceId();
  const { data: membersData } = useGetMembers({ workspaceId });
  const { data: user } = useCurrent();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if the current user is an admin
  useEffect(() => {
    if (membersData && user && Array.isArray(membersData.documents)) {
      const currentUserMember = membersData.documents.find(member => 
        member.userId === user.$id
      );
      
      if (currentUserMember) {
        setIsAdmin(currentUserMember.role === MemberRole.ADMIN);
      } else {
        setIsAdmin(false);
      }
    }
  }, [membersData, user]);

  const handleGenerateTasks = () => {
    const userInput = `
User Story Description:
${userStory.description || "No description provided"}

Acceptance Criteria:
${userStory.AcceptanceCriteria || "No acceptance criteria provided"}
    `;

    mutate(
      { json: { userInput } },
      {
        onSuccess: (data) => {
          try {
            // Find the JSON object in the response string
            const jsonString = data.data.response.match(/\{[\s\S]*\}/)?.[0];
            if (jsonString) {
              const tasks = JSON.parse(jsonString) as GeneratedTasks;
              setGeneratedTasks(tasks);
              setIsOpen(true);
              
              // Log the raw JSON to the console
              console.log("Generated Tasks (Raw JSON):", tasks);
              console.log("Full API Response:", data);
            } else {
              console.error("No valid JSON found in response");
              console.log("Raw API Response:", data);
            }
          } catch (error) {
            console.error("Error parsing generated tasks:", error);
            console.log("Raw API Response that failed to parse:", data);
          }
        },
      }
    );
  };

  // Function to add a single task to the project
  const handleAddSingleTask = (index: number) => {
    if (!generatedTasks) return;
    
    setAddingTaskIndex(index);    // Create task object
    const taskToCreate = {
      name: generatedTasks["Task Titles"][index],
      description: generatedTasks["Task description"][index],
      status: null,
      workspaceId,
      projectId: userStory.projectId,
      assigneeId: null,
      dueDate: null,
      position: 1000,
      role: mapRoleToPreferredRole(generatedTasks["Task Roles"]?.[index]) || undefined,
      experienceLevel: generatedTasks["Experience Level"]?.[index] || undefined,
      estimatedTime: generatedTasks["Estimated Time"]?.[index] || undefined
    };
    
    // Call the bulk create API with a single task
    bulkCreateTasks(
      { json: { tasks: [taskToCreate] } },
      {
        onSuccess: () => {
          // Mark this task as added
          setAddedTaskIndices(prev => new Set([...Array.from(prev), index]));
          setAddingTaskIndex(null);
        },
        onError: () => {
          setAddingTaskIndex(null);
        }
      }
    );
  };

  const handleAddTasksToProject = () => {
    if (!generatedTasks) return;
    
    // Filter out already added tasks
    const tasksToCreate = generatedTasks["Task Titles"]
      .map((title, index) => {
        if (addedTaskIndices.has(index)) {
          return null; // Skip already added tasks
        }        return {
          name: title,
          description: generatedTasks["Task description"][index],
          status: null,
          workspaceId,
          projectId: userStory.projectId,
          assigneeId: null,
          dueDate: null,
          position: 1000,
          role: mapRoleToPreferredRole(generatedTasks["Task Roles"][index]) || undefined,
          expertiseLevel: generatedTasks["Experience Level"][index] ?? undefined,
          estimatedHours: generatedTasks["Estimated Time"][index] ?? undefined
        };
      })
      .filter(task => task !== null); // Remove null entries
    
    // Only proceed if there are tasks to add
    if (tasksToCreate.length > 0) {
      // Call the bulk create API
      bulkCreateTasks(
        { json: { tasks: tasksToCreate.map(task => ({
          ...task,
          role: task.role ?? undefined,
          expertiseLevel: task.expertiseLevel ?? undefined,
          estimatedHours: task.estimatedHours ?? undefined
        })) } },
        {
          onSuccess: () => {
            // Mark all tasks as added
            const allIndices = new Set(Array.from(addedTaskIndices));
            for (let i = 0; i < generatedTasks["Task Titles"].length; i++) {
              allIndices.add(i);
            }
            setAddedTaskIndices(allIndices);
            
            // Close the task generator after successful creation
            setTimeout(() => {
              setIsOpen(false);
              setGeneratedTasks(null);
              setAddedTaskIndices(new Set());
            }, 1500);
          }
        }
      );
    }
  };

  const handleEditTask = (index: number) => {
    if (generatedTasks) {
      setEditingTaskIndex(index);
      setEditedTitle(generatedTasks["Task Titles"][index]);
      setEditedDescription(generatedTasks["Task description"][index]);
      setEditedRole(generatedTasks["Task Roles"]?.[index] || null);
      setExperienceLevel(generatedTasks["Experience Level"]?.[index] || "");
      setEditedEstimatedTime(generatedTasks["Estimated Time"]?.[index] || "");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskIndex(null);
    setEditedTitle("");
    setEditedDescription("");
    setEditedRole(null);
  };
  const handleSaveTask = (index: number) => {
    if (generatedTasks && editingTaskIndex !== null) {
      // Create a copy of the current tasks
      const updatedTasks = {
        "Task Titles": [...generatedTasks["Task Titles"]],
        "Task description": [...generatedTasks["Task description"]],
        "Task Roles": [...(generatedTasks["Task Roles"] || [])], // Preserve existing roles or default to an empty array
        "Experience Level": [...(generatedTasks["Experience Level"] || [])], // Preserve existing experience levels
        "Estimated Time": [...(generatedTasks["Estimated Time"] || [])] // Preserve existing time estimates
      };
      
      // Update the specific task
      updatedTasks["Task Titles"][index] = editedTitle;
      updatedTasks["Task description"][index] = editedDescription;
      updatedTasks["Task Roles"][index] = editedRole || "";
      updatedTasks["Experience Level"][index] = editedExperienceLevel;
      updatedTasks["Estimated Time"][index] = editedEstimatedTime;
      
      // Update state
      setGeneratedTasks(updatedTasks);
      setEditingTaskIndex(null);
    }
  };

  // Count remaining tasks to be added
  const getRemainingTasksCount = () => {
    if (!generatedTasks) return 0;
    return generatedTasks["Task Titles"].length - addedTaskIndices.size;
  };

  return (
    <div className="w-full mt-8">
      {!isOpen ? (
        <Card className="w-full border border-primary/20 bg-muted/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Task Generation</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Let AI analyze your user story and generate a breakdown of actionable tasks to implement it.
              </p>              {isAdmin ? (
                <Button 
                  onClick={handleGenerateTasks} 
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300" 
                  size="lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Tasks...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="mr-2 h-5 w-5" />
                      Generate Tasks with AI
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  disabled
                  variant="outline"
                  className="text-muted-foreground"
                  size="lg"
                >
                  <SparklesIcon className="mr-2 h-5 w-5" />
                  Admin only feature
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full border border-primary/20 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-semibold text-foreground">AI Generated Tasks</CardTitle>
                {generatedTasks && (
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                      {generatedTasks["Task Titles"].length} Tasks
                    </Badge>
                    {addedTaskIndices.size > 0 && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        {addedTaskIndices.size} Added
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="h-8 hover:bg-primary/10"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-muted-foreground mt-1">
              Tasks automatically generated from your user story requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-0">
            {generatedTasks && (
              <ScrollArea className="h-[350px] pr-4 mb-2">
                <div className="space-y-3">
                  {generatedTasks["Task Titles"].map((title, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "bg-card border rounded-lg p-4 shadow-sm transition-all duration-200",
                        addedTaskIndices.has(index) ? "border-green-300 bg-green-50 dark:bg-green-950/20" : "hover:border-primary/30 hover:shadow-md"
                      )}
                    >
                      {editingTaskIndex === index ? (
                        <div className="space-y-3">
                          <div>
                            <label htmlFor={`task-title-${index}`} className="block text-sm font-medium mb-1">Task Title</label>
                            <Input
                              id={`task-title-${index}`}
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor={`task-desc-${index}`} className="block text-sm font-medium mb-1">Task Description</label>
                            <Textarea
                              id={`task-desc-${index}`}
                              value={editedDescription}
                              onChange={(e) => setEditedDescription(e.target.value)}
                              className="w-full"
                              rows={3}
                            />
                          </div>                          <div>
                            <label htmlFor={`task-role-${index}`} className="block text-sm font-medium mb-1">Task Role</label>
                            <Select
                              value={editedRole || ""}
                              onValueChange={(value) => setEditedRole(value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Roles</SelectLabel>
                                  {Object.values(PreferredRole).map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {getPreferredRoleDisplay(role)}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label htmlFor={`task-experience-${index}`} className="block text-sm font-medium mb-1">Experience Level</label>
                            <Input
                              id={`task-experience-${index}`}
                              value={editedExperienceLevel}
                              onChange={(e) => setExperienceLevel(e.target.value)}
                              className="w-full"
                              placeholder="Junior, Mid-level, Senior, etc."
                            />
                          </div>
                          <div>
                            <label htmlFor={`task-time-${index}`} className="block text-sm font-medium mb-1">Estimated Time</label>
                            <Input
                              id={`task-time-${index}`}
                              value={editedEstimatedTime}
                              onChange={(e) => setEditedEstimatedTime(e.target.value)}
                              className="w-full"
                              placeholder="2 hours, 1 day, 3 days, etc."
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={handleCancelEdit}
                              className="border-red-300 hover:bg-red-50 hover:text-red-600"
                            >
                              <XIcon className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleSaveTask(index)}
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-center">
                              <ListTodoIcon className={cn("h-4 w-4 shrink-0 mt-1", addedTaskIndices.has(index) ? "text-green-600" : "text-primary")} />
                              <h3 className={cn("font-medium", addedTaskIndices.has(index) ? "text-green-700 dark:text-green-400" : "text-foreground")}>
                                {title}
                              </h3>
                              {addedTaskIndices.has(index) && (
                                <Badge className="bg-green-100 text-green-700 border-0 ml-2">Added</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!addedTaskIndices.has(index) && (                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className={cn(
                                    "h-7 w-7 p-0 rounded-full hover:bg-primary/10",
                                    !isAdmin && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                  )}
                                  onClick={isAdmin ? () => handleEditTask(index) : undefined}
                                  disabled={addingTaskIndex === index || !isAdmin}
                                >
                                  <PencilIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="sr-only">Edit task</span>
                                </Button>
                              )}
                            </div>
                          </div>                          {/* Display task role */}
                          <div className="flex flex-wrap gap-2 ml-6 mt-1 mb-2">
                            {generatedTasks["Task Roles"] && generatedTasks["Task Roles"][index] && (
                              <Badge
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                              >
                                {generatedTasks["Task Roles"][index]}
                              </Badge>
                            )}
                            {/* Display experience level */}
                            {generatedTasks["Experience Level"] && generatedTasks["Experience Level"][index] && (
                              <Badge
                                className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"
                              >
                                {generatedTasks["Experience Level"][index]}
                              </Badge>
                            )}
                            {/* Display estimated time */}
                            {generatedTasks["Estimated Time"] && generatedTasks["Estimated Time"][index] && (
                              <Badge
                                className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                              >
                                {generatedTasks["Estimated Time"][index]}
                                hr
                              </Badge>
                              
                            )}
                          </div>
                          <DottedSeparator className="my-2" />
                          <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground pl-6 mb-3">
                              {generatedTasks["Task description"][index]}
                            </p>
                            {!addedTaskIndices.has(index) ? (
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"                                  className={cn(
                                    "border-primary/40 text-primary hover:bg-primary/10",
                                    addingTaskIndex === index && "opacity-80",
                                    !isAdmin && "opacity-50 cursor-not-allowed"
                                  )}
                                  onClick={isAdmin ? () => handleAddSingleTask(index) : undefined}
                                  disabled={addingTaskIndex !== null || !isAdmin}
                                >
                                  {addingTaskIndex === index ? (
                                    <>
                                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                      Adding...
                                    </>
                                  ) : (
                                    <>
                                      <PlusCircleIcon className="mr-1 h-3.5 w-3.5" />
                                      Add This Task
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle2Icon className="h-3.5 w-3.5" />
                                  Added to project
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>          <CardFooter className="flex justify-center bg-muted/20 py-4 px-6 mt-2">
            {getRemainingTasksCount() > 0 ? (
              isAdmin ? (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={handleAddTasksToProject}
                  disabled={isAddingTasks || addingTaskIndex !== null}
                >
                  {isAddingTasks ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Tasks...
                    </>
                  ) : (
                    <>
                      <RocketIcon className="mr-2 h-5 w-5" />
                      Add Remaining {getRemainingTasksCount()} Tasks
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  disabled
                  className="text-muted-foreground"
                >
                  <RocketIcon className="mr-2 h-5 w-5" />
                  Only admins can add tasks
                </Button>
              )
            ) : (
              <div className="text-center">
                <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                  <CheckCircle2Icon className="h-5 w-5" />
                  All tasks have been added to the project!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    setGeneratedTasks(null);
                    setAddedTaskIndices(new Set());
                  }}
                  className="mt-2"
                >
                  Close
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};