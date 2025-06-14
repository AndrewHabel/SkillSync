import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCodeGeneration } from "@/features/CodeGeneration/api/use-code-generation";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
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

export const TaskCodeGenerator = ({ taskName, taskDescription, projectId, techStack }: TaskCodeGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const { mutate, isPending } = useCodeGeneration();
  const { data: projectDetails } = useGetProject({ projectId });
  
  const handleGenerateCode = () => {
    // Check if required fields are available
    if (!taskName.trim() || !taskDescription.trim()) {
      toast.error("Task name and description are required for code generation.");
      return;
    }    
    
    // Use project details if available to enhance the prompt
    const projectTechStack = projectDetails?.techStack || techStack || "Not specified";
    const projectName = projectDetails?.name || "Current project";
    const projectDescription = projectDetails?.description || "";
      const userInput = `
  Task Name: ${taskName}
  Task Description: ${taskDescription}
  Project Name: ${projectName}
  Project Description: ${projectDescription}
  Technology Stack: ${projectTechStack}
  
  Please analyze this task carefully in the context of the project described above and PRIORITIZE providing CODE solutions.
  
  IMPORTANT: Even for tasks that may seem like planning or research tasks, try to provide concrete code examples and implementations whenever possible. Users prefer to see working code they can modify rather than just guidelines.
  
  If it's a technical implementation task:
  - Provide detailed, production-ready code with comprehensive comments
  - Follow best practices for the specified tech stack
  - Include necessary imports and dependencies
  - Structure the code to align with modern ${projectTechStack} patterns
  - Ensure code is complete, runnable, and follows real-world implementation patterns
  
  If the task absolutely cannot be solved with code:
  - Still try to provide code snippets or templates that could be useful
  - Offer example implementations even if they're simplified versions
  - Include code-based tools or utilities that might help accomplish the task
  - Use the code field with executable examples, not just comments
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
              
              // Validate response structure
              if (response.steps && Array.isArray(response.steps) && response.steps.length > 0) {
                setGeneratedCode(response);
                setIsOpen(true);
                console.log("Parsed Code Generation:", response);
              } else {
                console.error("Invalid response structure:", response);
                toast.error("Generated code structure is invalid. Please try again.");
              }
            } else {
              console.error("No valid JSON found in response");
              console.log("Raw API Response:", data);
              toast.error("Failed to generate proper code format. Please try again.");
            }
          } catch (error) {
            console.error("Error parsing generated code:", error);
            console.log("Raw API Response that failed to parse:", data);
            toast.error("Error processing AI response. Please try again.");
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
              <>
                <div className="border-b border-primary/10 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-primary/5 text-primary font-normal">
                      Tech Stack: {generatedCode.techStack || "Not specified"}
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5 text-primary font-normal">
                      {generatedCode.steps.some(step => step.code && step.code.trim() !== '' && !step.code.startsWith('//')) 
                        ? "Implementation" 
                        : "Guidelines"} 
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="h-[350px] pr-4 mb-2">
                  <div className="space-y-4">
                    {generatedCode.steps.map((step) => {
                      const isCodeStep = step.code && step.code.trim() !== '' && !step.code.startsWith('//');
                      const isGuidelineStep = !step.code || step.code.trim() === '' || step.code.startsWith('//');
                      
                      return (
                        <div key={step.stepNumber} className={`bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-200 ${isCodeStep ? "border-l-4 border-l-indigo-500" : "border-l-4 border-l-blue-500"}`}>
                          <div className="flex items-start gap-2">
                            <div className={`${isCodeStep ? "bg-indigo-100 text-indigo-700" : "bg-blue-100 text-blue-700"} dark:bg-opacity-20 rounded-full p-2`}>
                              <span className="font-semibold">{step.stepNumber}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-foreground">{step.stepTitle}</h3>
                                {isCodeStep && (
                                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs">Code</Badge>
                                )}
                                {isGuidelineStep && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs">Guidance</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                              {step.code && step.code.trim() !== '' && !step.code.startsWith('//') && (
                                <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm">
                                  <code>{step.code}</code>
                                </pre>
                              )}
                              {(!step.code || step.code.trim() === '' || step.code.startsWith('//')) && (
                                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300">
                                  <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">Note</span>
                                  </div>
                                  <p>{step.code?.startsWith('//') ? step.code.substring(2).trim() : 'This step does not require code implementation.'}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
