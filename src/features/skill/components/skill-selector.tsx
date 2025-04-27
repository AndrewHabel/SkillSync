"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpertiseLevel, getExpertiseLevelDisplay } from "../types";
import { Slider } from "@/components/ui/slider";

// Helper function to get description for each expertise level
const getLevelDescription = (level: ExpertiseLevel): string => {
  switch (level) {
    case ExpertiseLevel.BEGINNER:
      return "Basic understanding with minimal practical experience";
    case ExpertiseLevel.ELEMENTARY:
      return "Fundamental knowledge with some practical experience";
    case ExpertiseLevel.INTERMEDIATE:
      return "Solid understanding with regular practical application";
    case ExpertiseLevel.ADVANCED:
      return "Deep understanding with extensive practical experience";
    case ExpertiseLevel.EXPERT:
      return "Comprehensive mastery with professional-level expertise";
    default:
      return "";
  }
};

// Technology options by category - based on the existing tech stack selector
const skillOptions = {
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

type SkillWithLevel = {
  name: string;
  level: ExpertiseLevel;
};

interface SkillSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSkills: SkillWithLevel[];
  onSelect: (skills: SkillWithLevel[]) => void;
}

export const SkillSelector = ({ open, onOpenChange, selectedSkills, onSelect }: SkillSelectorProps) => {
  const [activeTab, setActiveTab] = useState("frontend");
  const [tempSelected, setTempSelected] = useState<SkillWithLevel[]>(selectedSkills || []);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<ExpertiseLevel | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

  // Reset temp selection when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempSelected(selectedSkills);
    }
    onOpenChange(open);
  };

  // Add or update a skill with level
  const toggleSkill = (skill: string, level?: ExpertiseLevel) => {
    if (!level) {
      // Just select the skill without setting a level yet
      setActiveSkill(skill);
      // Reset slider value to 0 (Beginner) when a new skill is selected
      setSliderValue(0);
      return;
    }

    // We have a level, so add or update the skill
    const existing = tempSelected.find(s => s.name === skill);
    
    if (existing) {
      // Update existing skill's level
      setTempSelected(prev => 
        prev.map(s => s.name === skill ? { ...s, level } : s)
      );
    } else {
      // Add new skill with level
      setTempSelected(prev => [...prev, { name: skill, level }]);
    }
    
    // Clear active skill after setting level
    setActiveSkill(null);
    setActiveLevel(null);
  };

  // Remove a skill
  const removeSkill = (skill: string) => {
    setTempSelected(prev => prev.filter(s => s.name !== skill));
  };

  // Save changes and close
  const handleSave = () => {
    onSelect(tempSelected);
    onOpenChange(false);
  };

  // Display expertise level selection for a skill
  const showLevelSelector = () => {
    if (!activeSkill) return null;

    // Map expertise levels to numerical values for the slider
    const expertiseLevels = Object.values(ExpertiseLevel);
    
    // Get the current expertise level based on slider value
    const currentLevel = expertiseLevels[sliderValue];
    
    const handleSliderChange = (value: number[]) => {
      setSliderValue(value[0]);
    };

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-10 p-4">
        <div className="bg-card border rounded-lg shadow-xl p-8 max-w-lg w-full">
          <h3 className="text-xl font-semibold mb-6 text-center">
            Select expertise level for <span className="text-primary">{activeSkill}</span>
          </h3>
          
          <div className="mb-10 px-4">
            <div className="text-center mb-8">
              <div className="text-2xl font-medium text-primary mb-1">
                {getExpertiseLevelDisplay(currentLevel)}
              </div>
              <p className="text-sm text-muted-foreground">
                {getLevelDescription(currentLevel)}
              </p>
            </div>
            
            <Slider
              value={[sliderValue]}
              max={expertiseLevels.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="my-6"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
          
          <div className="flex justify-between pt-2 gap-3">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setActiveSkill(null);
                setActiveLevel(null);
                // Reset slider value when canceling
                setSliderValue(0);
              }}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              size="lg"
              onClick={() => toggleSkill(activeSkill, currentLevel)}
              className="px-6"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[85vw] md:max-w-[850px] lg:max-w-[950px] max-h-[90vh] overflow-hidden flex flex-col bg-card">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl md:text-3xl font-bold">Select Your Skills & Expertise</DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-hidden py-6">
          {/* Expertise level selector overlay */}
          {activeSkill && showLevelSelector()}
          
          <div className="flex flex-col gap-6 h-full">
            {/* Selected Skills - Using theme variables for background colors */}
            <div className="border rounded-lg p-4 overflow-y-auto shadow-sm bg-muted border-border">
              <h3 className="text-lg font-medium mb-3 text-primary">Selected Skills</h3>
              {tempSelected.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center">No skills selected</p>
              ) : (
                <div className="flex flex-wrap gap-2.5 ">
                  {tempSelected.map(({ name, level }) => (
                    <Badge 
                      key={name} 
                      className="flex bg-card items-center text-muted-foreground space-x-1.5 py-2 px-3 text-sm hover:bg-accent/70 transition-colors"
                    >
                      <span>{name}</span>
                      <span className="font-normal  text-xs px-1.5 py-0.5 bg-primary/20 dark:bg-primary/30 rounded">
                        {getExpertiseLevelDisplay(level)}
                      </span>
                      <button 
                        onClick={() => removeSkill(name)} 
                        className="h-5 w-5 ml-1.5 hover:bg-accent rounded-full flex items-center justify-center"
                        aria-label={`Remove ${name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Skill selection - Using theme variables for background colors */}
            <div className="border rounded-lg overflow-hidden flex flex-col shadow-sm bg-muted border-border">

              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <TabsList className="justify-start flex-nowrap overflow-x-auto pt-3 px-2 bg-accent/50 whitespace-nowrap scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {Object.entries(skillOptions).map(([key, { label }]) => (
                    <TabsTrigger key={key} value={key} className="text-sm px-4 py-2 font-medium flex-shrink-0">
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(skillOptions).map(([key, { technologies }]) => (
                  <TabsContent key={key} value={key} className="flex-1 h-[320px] overflow-y-auto p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {technologies.map((tech) => {
                        const isSelected = tempSelected.some(item => item.name === tech);
                        const expertiseLevel = tempSelected.find(item => item.name === tech)?.level;
                        
                        return (
                          <Button
                            key={tech}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-auto py-2 justify-start overflow-hidden text-xs",
                              isSelected && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => toggleSkill(tech)}
                          >
                            <div className="flex items-center w-full">
                              <span className="truncate">{tech}</span>
                              {isSelected && expertiseLevel && (
                                <Badge 
                                  variant="outline" 
                                  className="ml-auto bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 border-primary/50"
                                >
                                  {getExpertiseLevelDisplay(expertiseLevel)}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)} className="px-6">
            Cancel
          </Button>
          <Button onClick={handleSave} size="lg" className="px-6">
            Save ({tempSelected.length} skills)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};