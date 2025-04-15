import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskGeneration } from "@/features/taskgeneration/api/use-task-generation";
import { Separator } from "@/components/ui/separator";
import { Wand2Icon, Loader2, ArrowDownIcon, PencilIcon, XIcon, CheckIcon, PlusCircleIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { UserStory } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBulkCreateTasks } from "@/features/tasks/api/use-bulk-create-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { TaskStatus } from "@/features/tasks/types";
import { useGetMembers } from "@/features/members/api/use-get-members";

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
    <div className="w-full mt-4">
      {!isOpen ? (
        <Button 
          onClick={handleGenerateTasks} 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Tasks...
            </>
          ) : (
            <>
              <Wand2Icon className="mr-2 h-4 w-4" />
              Generate Tasks from User Story
            </>
          )}
        </Button>
      ) : (
        <Card className="w-full border border-border shadow-md">
          <CardHeader className="bg-muted/50 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-primary">Generated Tasks</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="h-8"
              >
                <ArrowDownIcon className="h-4 w-4 rotate-180" />
              </Button>
            </div>
            <CardDescription>
              Tasks automatically generated based on your user story
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {generatedTasks && (
              <>
                <ScrollArea className="h-[300px] pr-4 mb-4">
                  <div className="space-y-3">
                    {generatedTasks["Task Titles"].map((title, index) => (
                      <div key={index} className="bg-card border rounded-md p-3 shadow-sm">
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
                              >
                                <XIcon className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                variant="solid"
                                onClick={() => handleSaveTask(index)}
                              >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <h3 className="font-medium text-primary mb-1">{title}</h3>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0" 
                                onClick={() => handleEditTask(index)}
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit task</span>
                              </Button>
                            </div>
                            <DottedSeparator className="my-2" />
                            <p className="text-sm text-muted-foreground">
                              {generatedTasks["Task description"][index]}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <DottedSeparator className="my-4" />
                
                <div className="flex justify-end">
                  <Button
                    variant="solid"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    onClick={handleAddTasksToProject}
                    disabled={isAddingTasks}
                  >
                    {isAddingTasks ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Tasks...
                      </>
                    ) : (
                      <>
                        <PlusCircleIcon className="mr-2 h-4 w-4" />
                        Add Tasks to Project
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};