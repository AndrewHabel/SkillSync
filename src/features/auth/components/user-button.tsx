"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { DottedSeparator } from "@/components/dotted-separator";
import { Loader, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useLogout } from "../api/use-logout";
import { useCurrent } from "../api/use-current";
import { FaUserAlt } from "react-icons/fa";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import Link from "next/link";
import { useGetMemberProfile } from "@/features/members/api/use-get-member";

export const UserButton = () => {

  const { data:user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();
  const workspaceId = useWorkspaceId();

  const { data: memberProfile } = useGetMemberProfile({
    workspaceId: workspaceId || "", 
    memberId: user?.$id || "", 
  });

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const { name, email } = user;

  console.log("memberProfile", name, email);

  if(memberProfile){
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-14 hover:opacity-75 transition border border-border">
          {memberProfile?.image ? (
            <AvatarImage className="" src={memberProfile.image} alt={name || "User"} />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground font-medium flex items-center justify-center">
              {name ? name.charAt(0).toUpperCase() : <FaUserAlt className="size-4" />}
            </AvatarFallback>
          )}
        </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
          <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-16 border border-border">
              {memberProfile?.image ? (
                <AvatarImage src={memberProfile.image} alt={name || "User"} />
              ) : (
                <AvatarFallback className="bg-muted text-xl font-medium text-muted-foreground flex items-center justify-center">
                  {name ? name.charAt(0).toUpperCase() : <FaUserAlt className="size-6" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-neutral-900">{name || "User"}</p>
              <p className="text-xs text-neutral-600">{email}</p>
            </div>
          </div>
          <DottedSeparator className="mb-1" />
          <Link href={`/workspaces/${workspaceId}/memberprofile/${user.$id}`}>
            <DropdownMenuItem
              className="h-auto flex items-center justify-center text-blue-700 font-medium cursor-pointer"
            >
              <FaUserAlt className="size-4 mr-2"/>
                Profile
            </DropdownMenuItem>
          </Link>
          <DottedSeparator className="mb-1" />
          <DropdownMenuItem
            onClick={() => logout()} // Fixed this
            className="h-auto flex items-center justify-center text-amber-700 font-medium cursor-pointer"
          >
            <LogOut className="size-4 mr-2" />
              Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return(
    <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="size-14 hover:opacity-75 transition border border-border">
            <AvatarFallback className="bg-muted font-medium text-muted-foreground flex items-center justify-center">
              {name ? name.charAt(0).toUpperCase() : <FaUserAlt className="size-4" />}
            </AvatarFallback>
        </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
          <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <Avatar className="size-16 border border-border">
                <AvatarFallback className="bg-muted text-xl font-medium text-muted-foreground flex items-center justify-center">
                  {name ? name.charAt(0).toUpperCase() : <FaUserAlt className="size-6" />}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-neutral-900">{name || "User"}</p>
              <p className="text-xs text-neutral-600">{email}</p>
            </div>
          </div>
          <DottedSeparator className="mb-1" />
          <DropdownMenuItem
            onClick={() => logout()} // Fixed this
            className="h-auto flex items-center justify-center text-amber-700 font-medium cursor-pointer"
          >
            <LogOut className="size-4 mr-2" />
              Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
};
