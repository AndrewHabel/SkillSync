import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskGeneration } from "@/features/taskgeneration/api/use-task-generation";
import { Separator } from "@/components/ui/separator";
import { Wand2Icon, Loader2, ArrowDownIcon } from "lucide-react";
import { DottedSeparator } from "@/components/dotted-separator";
import { UserStory } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";

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
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {generatedTasks["Task Titles"].map((title, index) => (
                    <div key={index} className="bg-card border rounded-md p-3 shadow-sm">
                      <h3 className="font-medium text-primary mb-1">{title}</h3>
                      <DottedSeparator className="my-2" />
                      <p className="text-sm text-muted-foreground">
                        {generatedTasks["Task description"][index]}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};