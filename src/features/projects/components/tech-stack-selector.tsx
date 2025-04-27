"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Technology options by category
const techOptions = {
  frontend: {
    label: "Frontend",
    technologies: [
      "React.js", "Angular", "Vue.js", "Next.js", "Svelte", 
      "HTML", "CSS", "JavaScript", "TypeScript", "Bootstrap",
      "Tailwind CSS", "Material UI", "Chakra UI", "Redux", "Zustand"
    ]
  },
  backend: {
    label: "Backend",
    technologies: [
      "Node.js", "Express.js", "Django", "Flask", "Ruby on Rails",
      "Spring Boot", "Laravel", "ASP.NET", ".NET", "FastAPI",
      "NestJS", "Strapi", "GraphQL", "REST API", "Python"
    ]
  },
  database: {
    label: "Database",
    technologies: [
      "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Firebase",
      "Redis", "Cassandra", "DynamoDB", "Supabase", "Oracle",
      "MS SQL Server", "CouchDB", "Neo4j", "Elasticsearch"
    ]
  },
  devops: {
    label: "DevOps",
    technologies: [
      "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud",
      "Jenkins", "GitHub Actions", "CircleCI", "Terraform", "Ansible",
      "Prometheus", "Grafana", "ELK Stack", "Nginx", "Apache"
    ]
  },
  testing: {
    label: "Testing",
    technologies: [
      "Jest", "React Testing Library", "Cypress", "Selenium", "Playwright",
      "Mocha", "Chai", "Pytest", "JUnit", "TestNG",
      "Postman", "SonarQube", "ESLint", "Jasmine"
    ]
  },
  ai: {
    label: "AI & ML",
    technologies: [
      "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "NLTK",
      "OpenAI API", "Hugging Face", "Pandas", "NumPy", "Jupyter",
      "CUDA", "R", "Matplotlib", "Seaborn"
    ]
  }
};

interface TechStackSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTech: string[];
  onSelect: (selectedTech: string[]) => void;
}

export const TechStackSelector = ({ 
  open, 
  onOpenChange, 
  selectedTech, 
  onSelect 
}: TechStackSelectorProps) => {
  const [localSelectedTech, setLocalSelectedTech] = useState<string[]>(selectedTech);
  
  // Handle tech item toggle
  const toggleTech = (tech: string) => {
    setLocalSelectedTech((current) => {
      if (current.includes(tech)) {
        return current.filter(t => t !== tech);
      } else {
        return [...current, tech];
      }
    });
  };

  // Handle save selection
  const handleSave = () => {
    onSelect(localSelectedTech);
    onOpenChange(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalSelectedTech(selectedTech);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Select Project Tech Stack
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {localSelectedTech.map((tech) => (
            <Badge key={tech} variant="secondary" className="py-1">
              {tech}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => toggleTech(tech)}
              />
            </Badge>
          ))}
        </div>
        
        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-4">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="devops">DevOps</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="ai">AI & ML</TabsTrigger>
          </TabsList>
          
          {Object.entries(techOptions).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {category.technologies.map((tech) => {
                  const isSelected = localSelectedTech.includes(tech);
                  return (
                    <Button
                      key={tech}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-auto py-2 px-3 justify-between",
                        isSelected && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => toggleTech(tech)}
                    >
                      <span>{tech}</span>
                      {isSelected && <Check className="h-4 w-4 ml-2" />}
                    </Button>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="default" onClick={handleSave}>
            Save Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};