"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Team } from "../types";

interface TeamAvatarProps {
  team: Team;
  className?: string;
}

export const TeamAvatar = ({ team, className }: TeamAvatarProps) => {
  // Get the first letter of the team type for the fallback
  const fallback = team.teamtype.charAt(0);
  
  // Use different background colors based on team type
  const getBackgroundColor = () => {
    switch (team.teamtype) {
      case "Frontend Team":
        return "bg-blue-500";
      case "Backend Team":
        return "bg-green-500";
      case "Data Analytics Team":
        return "bg-purple-500";
      case "User interface Team":
        return "bg-pink-500";
      case "Performance Engineer Team":
        return "bg-yellow-500";
      case "Tester Team":
        return "bg-orange-500";
      case "Security Specialist Team":
        return "bg-red-500";
      case "Database Administration Team":
        return "bg-cyan-500";
      case "DevOps Team":
        return "bg-indigo-500";
      case "AI Specialist Team":
        return "bg-violet-500";
      case "Data Scientist Team":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <Avatar className={className}>
      <AvatarFallback className={getBackgroundColor()}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
};