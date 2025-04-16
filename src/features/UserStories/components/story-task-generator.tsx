import { useState } from "react";
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
  ListTodoIcon
} from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { UserStory } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBulkCreateTasks } from "@/features/tasks/api/use-bulk-create-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { TaskStatus } from "@/features/tasks/types";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Badge } from "@/components/ui/badge";

interface StoryTaskGeneratorProps {
  userStory: UserStory;
}

interface GeneratedTasks {
  "Task Titles": string[];
  "Task description": string[];
}

export const StoryTaskGenerator = ({ userStory }: StoryTaskGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTasks | null>(null);
  const { mutate, isPending } = useTaskGeneration();
  const { mutate: bulkCreateTasks, isPending: isAddingTasks } = useBulkCreateTasks();
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  
  // Get necessary context data
  const workspaceId = useWorkspaceId();
  const { data: membersData } = useGetMembers({ workspaceId });

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

  const handleAddTasksToProject = () => {
    if (!generatedTasks) return;
    
    // Create task objects for each generated task
    const tasksToCreate = generatedTasks["Task Titles"].map((title, index) => {
      return {
        name: title,
        description: generatedTasks["Task description"][index],
        status: null,
        workspaceId,
        projectId: userStory.projectId,
        assigneeId: null,
        dueDate: null,
        position: 1000
      };
    });
    
    // Call the bulk create API
    bulkCreateTasks(
      { json: { tasks: tasksToCreate } },
      {
        onSuccess: () => {
          // Close the task generator after successful creation
          setIsOpen(false);
          setGeneratedTasks(null);
        }
      }
    );
  };

  const handleEditTask = (index: number) => {
    if (generatedTasks) {
      setEditingTaskIndex(index);
      setEditedTitle(generatedTasks["Task Titles"][index]);
      setEditedDescription(generatedTasks["Task description"][index]);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskIndex(null);
    setEditedTitle("");
    setEditedDescription("");
  };

  const handleSaveTask = (index: number) => {
    if (generatedTasks && editingTaskIndex !== null) {
      // Create a copy of the current tasks
      const updatedTasks = {
        "Task Titles": [...generatedTasks["Task Titles"]],
        "Task description": [...generatedTasks["Task description"]]
      };
      
      // Update the specific task
      updatedTasks["Task Titles"][index] = editedTitle;
      updatedTasks["Task description"][index] = editedDescription;
      
      // Update state
      setGeneratedTasks(updatedTasks);
      setEditingTaskIndex(null);
    }
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
              </p>
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
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                    {generatedTasks["Task Titles"].length} Tasks
                  </Badge>
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
                    <div key={index} className="bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-200">
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
                              <ListTodoIcon className="h-4 w-4 text-primary shrink-0 mt-1" />
                              <h3 className="font-medium text-foreground">{title}</h3>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 rounded-full hover:bg-primary/10" 
                              onClick={() => handleEditTask(index)}
                            >
                              <PencilIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="sr-only">Edit task</span>
                            </Button>
                          </div>
                          <DottedSeparator className="my-2" />
                          <p className="text-sm text-muted-foreground pl-6">
                            {generatedTasks["Task description"][index]}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          <CardFooter className="flex justify-center bg-muted/20 py-4 px-6 mt-2">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleAddTasksToProject}
              disabled={isAddingTasks}
            >
              {isAddingTasks ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Tasks...
                </>
              ) : (
                <>
                  <RocketIcon className="mr-2 h-5 w-5" />
                  Add All Tasks to Project
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};