"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
    CardDescription,
} from "@/components/ui/card"
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MoreVerticalIcon, User2Icon, Crown, UserRoundCheck, UserCog, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { DottedSeparator } from "@/components/dotted-separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Fragment, useEffect, useState } from "react";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { Member, MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useGetSkills } from "@/features/skill/api/use-get-skills";
import { ExpertiseLevel, getExpertiseLevelDisplay } from "@/features/skill/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const MembersList = () => {
    const workspaceId = useWorkspaceId();
    const { data, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
    const { mutate: deleteMember, isPending: isDeleteingMember } = useDeleteMember();
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove Member",
        "Are you sure you want to remove this member?",
        "destructive"
    );
    const { data: skillsData, isLoading: isLodingSkills} = useGetSkills({workspaceId});

    const queryClient = useQueryClient();
    const [membersWithSkills, setMembersWithSkills] = useState<any[]>([]);
    const [isLoadingSkills, setIsLoadingSkills] = useState(true);

    console.log(skillsData, "skillsData");
    console.log(data, "membersData");

    useEffect(() => {
        const fetchSkillsForMembers = async () => {
            if (!data?.documents?.length) return;
            
            setIsLoadingSkills(true);
            const membersData = [...data.documents];
            const membersWithSkillsData = [];
            
            for (const member of membersData) {

                const memberSkills = skillsData?.documents?.filter((skill: any) => skill.userId === member.$id) || [];
                const skillsWithLevel = memberSkills.map((skill: any) => ({
                    ...skill,
                    level: skill.experienceLevel as ExpertiseLevel,
                }));
                
                membersWithSkillsData.push({
                    ...member,
                    skills: skillsWithLevel,
                });
               
            }
            console.log(membersWithSkillsData, "membersWithSkillsData");
            setMembersWithSkills(membersWithSkillsData);
            setIsLoadingSkills(false);
        };
        
        fetchSkillsForMembers();
    }, [data, workspaceId, queryClient]);

    const handelDeleteMember = async (memberId: string) => {
        const ok = await confirm();
        if (!ok) return;

        deleteMember({ param: { memberId } }, {
            onSuccess: () => {
                window.location.reload();
            },
        });
    }

    const handelUpdateMember = async (memberId: string, role: MemberRole, member: Member) => {
        updateMember({
            form: { 
                name: member.name,
                image: member.image,
                role: role,
            },
            param: { memberId }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
            }
        });
    }

    // Role icon mapping
    const getRoleIcon = (role: MemberRole) => {
        switch(role) {
            case MemberRole.ADMIN:
                return <Crown className="size-4 mr-1 text-amber-500" />;
            case MemberRole.MEMBER:
                return <UserRoundCheck className="size-4 mr-1 text-blue-500" />;
            default:
                return <User2Icon className="size-4 mr-1" />;
        }
    };

    const isLoading = isLoadingMembers || isLoadingSkills;

    return (
        <Card className='w-full h-full border-none shadow-none max-w-full'>
            <ConfirmDialog />
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button asChild variant="secondary" size="sm">
                        <Link href={`/workspaces/${workspaceId}`}>
                            <ArrowLeftIcon className="size-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <CardTitle className="text-lg font-bold">
                        Members List
                    </CardTitle>
                </CardHeader>
            </motion.div>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-5 md:p-6 max-w-full">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 p-4 md:p-6 rounded-lg">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                            <Card key={index} className="member-card border shadow-sm">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-14 w-14 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-36" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="space-y-3">
                                        <Skeleton className="h-3 w-full" />
                                        <div className="flex flex-wrap gap-1">
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                            <Skeleton className="h-6 w-14 rounded-full" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 border-t flex justify-end">
                                    <Skeleton className="h-9 w-9 rounded-md" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.1
                                }
                            }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 gap-4 md:gap-5  p-4 md:p-6 rounded-lg"
                    >
                        {membersWithSkills.map((member, index) => {
                            // Define accent color based on role
                            const roleColors = {
                                [MemberRole.ADMIN]: "border-l-amber-500",
                                [MemberRole.MEMBER]: "border-l-blue-500"
                            };
                            const borderAccent = roleColors[member.role] || "border-l-primary";
                            
                            return (
                                <motion.div
                                    key={member.$id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 15,
                                        duration: 0.4
                                    }}
                                    className="h-full"
                                >
                                    <Card className={`member-card border shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${borderAccent} h-full flex flex-col`}>
                                        <CardHeader className="p-5 pb-3">
                                            <div className="flex items-center gap-4">
                                                <MembersAvatar
                                                    className="size-16 border-2 border-border"
                                                    fallbackclassName="text-xl"
                                                    name={member.name}
                                                    imageUrl={member.image}
                                                />
                                                <div>
                                                    <div className="flex items-center">
                                                        <h3 className="font-semibold text-lg">{member.name}</h3>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className="ml-2 flex items-center">
                                                                        {getRoleIcon(member.role)}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        {member.role === MemberRole.ADMIN 
                                                                            ? 'Administrator' 
                                                                            : 'Team Member'}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5 pt-3 flex-grow">
                                            <h4 className="text-sm font-medium mb-3 flex items-center">
                                                <UserCog className="size-3.5 mr-1.5" />
                                                Skills & Expertise
                                            </h4>
                                            {member.skills && member.skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {member.skills.slice(0, 5).map((skill: any, skillIndex: number) => (
                                                        <Badge 
                                                            key={`${member.$id}-skill-${skillIndex}`}
                                                            variant="outline"
                                                            className="bg-card text-xs py-1.5 px-2.5 flex items-center gap-1.5"
                                                        >
                                                            <span>{skill.skillname}</span>
                                                            <span className="text-xs px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 rounded">
                                                                {getExpertiseLevelDisplay(skill.level)}
                                                            </span>
                                                        </Badge>
                                                    ))}
                                                    {member.skills.length > 5 && (
                                                        <Badge variant="outline" className="bg-card py-1.5 px-2.5">
                                                            +{member.skills.length - 5} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No skills listed</p>
                                            )}
                                        </CardContent>
                                        <CardFooter className="p-5 pt-3 border-t flex justify-between items-center mt-auto">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild
                                                className="text-xs"
                                            >
                                                <Link href={`/workspaces/${workspaceId}/memberprofile/${member.userId}`}>
                                                    View Profile
                                                </Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button className="ml-auto" variant="ghost" size="icon">
                                                        <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent side="bottom" align="end" className="w-60">
                                                    <DropdownMenuItem 
                                                        className="font-medium cursor-pointer" 
                                                        onClick={() => { handelUpdateMember(member.$id, MemberRole.ADMIN, member) }} 
                                                        disabled={isUpdatingMember || member.role === MemberRole.ADMIN}
                                                    >
                                                        <Crown className="mr-2 size-4 text-amber-500" />
                                                        Set As Administrator
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="font-medium cursor-pointer" 
                                                        onClick={() => { handelUpdateMember(member.$id, MemberRole.MEMBER, member) }} 
                                                        disabled={isUpdatingMember || member.role === MemberRole.MEMBER}
                                                    >
                                                        <UserRoundCheck className="mr-2 size-4 text-blue-500" />
                                                        Set As Member
                                                    </DropdownMenuItem>
                                                    <Separator className="my-2" />
                                                    <DropdownMenuItem 
                                                        className="font-medium text-destructive cursor-pointer" 
                                                        onClick={() => { handelDeleteMember(member.$id) }} 
                                                        disabled={isDeleteingMember}
                                                    >
                                                        <User2Icon className="mr-2 size-4" />
                                                        Remove {member.name}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                        {(!membersWithSkills || membersWithSkills.length === 0) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.2, ease: "easeInOut" }}
                                className="text-center py-8 col-span-full"
                            >
                                <User2Icon className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No members found</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
};