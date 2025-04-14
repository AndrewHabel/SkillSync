import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


interface MembersAvatarProps {
  name: string;
  className?: string; 
  fallbackclassName?: string;
  imageUrl?: string;
};

export const MembersAvatar= ({
  name,
  className,
  fallbackclassName,
  imageUrl,
}: MembersAvatarProps) => {

  return(
    <Avatar className={cn("size-5 transition border-neutral-300 rounded-md", className)}>
      {imageUrl ? (
        <AvatarImage className="" src={imageUrl} alt={name || "User"} />
      ):(
        <AvatarFallback className={cn(
          "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center",
          fallbackclassName
        )}>
          {name[0].toUpperCase()}
        </AvatarFallback>
      )}
      
    </Avatar>
  );
}
