import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCodeGeneration } from "@/features/CodeGeneration/api/use-code-generation";
import { Separator } from "@/components/ui/separator";
import { 
  SparklesIcon, 
  Loader2, 
  ChevronUpIcon,
  CodeIcon,
  AlertCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useGetProject } from "@/features/projects/api/use-get-project";

interface TaskCodeGeneratorProps {
  taskName: string;
  taskDescription: string;
  projectId: string;
  techStack: string;
}

interface GeneratedCode {
  taskName: string;
  techStack: string;
  steps: {
    stepNumber: number;
    stepTitle: string;
    description: string;
    code: string;
  }[];
}

export const TaskCodeGenerator = ({ taskName, taskDescription, techStack }: TaskCodeGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const { mutate, isPending } = useCodeGeneration();

  const handleGenerateCode = () => {
    const userInput = `
  Task Name: ${taskName}
  Task Description: ${taskDescription}
  Technology Stack: ${techStack}
    `;
  
    mutate(
      { json: { userInput } },
      {
        onSuccess: (data) => {
          try {
            // Attempt to extract JSON from the response string
            const jsonString = data.data.response.match(/\{[\s\S]*\}/)?.[0];
            if (jsonString) {
              const response = JSON.parse(jsonString);
              setGeneratedCode(response);
              setIsOpen(true);
              console.log("Parsed Code Generation:", response);
            } else {
              console.error("No valid JSON found in response");
              console.log("Raw API Response:", data);
            }
          } catch (error) {
            console.error("Error parsing generated code:", error);
            console.log("Raw API Response that failed to parse:", data);
          }
        },
      }
    );
  };
  

  return (
    <div className="w-full mt-8">
      {!isOpen ? (
        <Card className="w-full border border-primary/20 bg-muted/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <CodeIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Code Generation</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Let AI analyze your task and generate implementation code with step-by-step instructions.
              </p>
              <Button 
                onClick={handleGenerateCode} 
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300" 
                size="lg"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Code...
                  </>
                ) : (
                  <>
                    <CodeIcon className="mr-2 h-5 w-5" />
                    Generate Code with AI
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
                <CodeIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-semibold text-foreground">AI Generated Code</CardTitle>
                {generatedCode && (
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                    {generatedCode.steps.length} Steps
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
              Implementation code and steps generated from your task requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-0">
            {generatedCode && (
              <ScrollArea className="h-[350px] pr-4 mb-2">
                <div className="space-y-4">
                  {generatedCode.steps.map((step) => (
                    <div key={step.stepNumber} className="bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-2">
                        <div className="bg-primary/10 rounded-full p-2">
                          <span className="text-primary font-semibold">{step.stepNumber}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-2">{step.stepTitle}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                          <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm">
                            <code>{step.code}</code>
                          </pre>
                        </div>
                      </div>
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
