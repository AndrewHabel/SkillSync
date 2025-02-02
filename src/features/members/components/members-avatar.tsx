import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


interface MembersAvatarProps {
  name: string;
  className?: string; 
  fallbackclassName?: string;
};

export const MembersAvatar= ({
  name,
  className,
  fallbackclassName
}: MembersAvatarProps) => {

  return(
    <Avatar className={cn("size-5 transition border-neutral-300 rounded-md", className)}>
      <AvatarFallback className={cn(
        "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center",
        fallbackclassName
      )}>
        {name}
      </AvatarFallback>
    </Avatar>
  );
}