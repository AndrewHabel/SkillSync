"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useMemberId } from "@/features/members/hooks/use-member-id";
import { Badge } from "@/components/ui/badge";
import { useGetSkills } from "../api/use-get-skills";
import { useBulkCreateSkills } from "../api/use-bulk-create-skills";
import { ExpertiseLevel, Skill, getExpertiseLevelDisplay } from "../types";
import { SkillSelector } from "./skill-selector";
import { PlusIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ManageSkillsProps {
  userId: string;
}

export const ManageSkills = ({ userId }: ManageSkillsProps) => {
  const workspaceId = useWorkspaceId();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { data: skillsData, isLoading, refetch } = useGetSkills({ workspaceId, userId });
  const { mutate: bulkCreateSkills, isPending } = useBulkCreateSkills();

  const userSkills = skillsData?.documents || [];
  
  // Add debugging to see what data is coming from the API
  console.log("Skills data received:", skillsData);
  console.log("User skills:", userSkills);
  console.log("First skill object (raw):", userSkills[0]);
  
  // Create more robust skill mapping that will work with any property name variation
  const allSkills = userSkills.map(skill => {
    console.log("Processing skill:", skill);
    return {
      // Try all possible property names for the skill name
      name: skill.name || skill.skillName || skill.skill_name || skill.skillname || "Unknown Skill",
      // Try all possible property names for the level
      level: skill.level || skill.experienceLevel || skill.experience_level || skill.expertiseLevel || ExpertiseLevel.BEGINNER,
      id: skill.$id || skill.id || Math.random().toString()
    };
  });

  const handleAddSkills = (selectedSkills: { name: string; level: ExpertiseLevel }[]) => {
    // Filter out skills that the user already has
    const existingSkillNames = userSkills.map(skill => skill.name);
    const newSkills = selectedSkills.filter(skill => !existingSkillNames.includes(skill.name));
    
    // Update existing skills if level has changed
    const updatedSkills = selectedSkills.filter(skill => {
      const existingSkill = userSkills.find(s => s.name === skill.name);
      return existingSkill && existingSkill.level !== skill.level;
    });
    
    // Combine new and updated skills
    const skillsToSave = [...newSkills, ...updatedSkills].map(skill => ({
        userId: userId,
        skillName: skill.name,
        experienceLevel: skill.level
    }));
    
    if (skillsToSave.length === 0) return;
    
    bulkCreateSkills(
      { json: { workspaceId, skills: skillsToSave } },
      {
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  return (
    <Card className="w-full h-full border shadow-md bg-card mt-6">
      <CardContent className="p-7">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">My Technical Skills</h3>
            <Button onClick={() => setSelectorOpen(true)} size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Skills
            </Button>
          </div>
          
          <DottedSeparator className="my-5" />
          
          {isLoading ? (
            <div className="text-center p-4">Loading skills...</div>
          ) : userSkills.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <p>You haven't added any skills yet.</p>
              <p className="mt-2">Click "Add Skills" to showcase your technical expertise.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allSkills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="font-medium">{skill.name}</div>
                  <Badge>{getExpertiseLevelDisplay(skill.level)}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <SkillSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        selectedSkills={allSkills}
        onSelect={handleAddSkills}
      />
    </Card>
  );
};