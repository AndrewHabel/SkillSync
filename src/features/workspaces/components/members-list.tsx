"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { DottedSeparator } from "@/components/dotted-separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { Fragment } from "react";
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

export const MembersList = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetMembers({ workspaceId });
    const { mutate: deleteMember, isPending: isDeleteingMember } = useDeleteMember();
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove Member",
        "Are you sure you want to remove this member?",
        "destructive"
    );
    const queryClient = useQueryClient();

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
                skills: Array.isArray(member.skills) ? member.skills.join(',') : '',
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

   

    return (
        <Card className='w-full h-full border-none shadow-none'>
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
            <CardContent className="p-7">
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.08,
                                delayChildren: 0.1,
                                when: "beforeChildren",
                                staggerDirection: 1
                            }
                        }
                    }}
                    className="space-y-4 members-list-bg p-5"
                >
                    {data?.documents.map((member, index) => {
                        // Define background classes based on index
                        const bgColorClasses = [
                            "bg-primary/10",
                            "bg-secondary/30",
                            "bg-accent/20",
                            "bg-muted/40",
                            "bg-popover/20"
                        ];
                        const bgClass = bgColorClasses[index % bgColorClasses.length];
                        
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
                                className="space-y-4"
                            >
                                <motion.div 
                                    whileHover={{ 
                                        scale: 1.02, 
                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                        transition: { duration: 0.2 }
                                    }}
                                    className={`flex items-center gap-2 p-4 rounded-lg ${bgClass} transition-all`}
                                >  
                                    <MembersAvatar
                                        className="size-10"
                                        fallbackclassName="text-lg"
                                        name={member.name}
                                        imageUrl={member.image}
                                    />
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-forground">{member.email}</p>
                                        <p className="text-xs text-muted-forground">
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="ml-auto" variant="secondary" size="icon">
                                                <MoreVerticalIcon className="size-4 text-muted-forground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="start">
                                            <DropdownMenuItem className="font-medium" onClick={() => { handelUpdateMember(member.$id, MemberRole.ADMIN, member) }} disabled={isUpdatingMember}>Set As Adminstrator</DropdownMenuItem>
                                            <DropdownMenuItem className="font-medium" onClick={() => { handelUpdateMember(member.$id, MemberRole.MEMBER, member) }} disabled={isUpdatingMember}>Set As Member</DropdownMenuItem>
                                            <DropdownMenuItem className="font-medium text-amber-700" onClick={() => { handelDeleteMember(member.$id) }} disabled={isDeleteingMember}>Remove {member.name}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </motion.div>
                                {index !== data.documents.length - 1 && (
                                    <Separator className="my-2.5" />
                                )}
                            </motion.div>
                        );
                    })}
                    {(!data?.documents || data.documents.length === 0) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2, ease: "easeInOut" }}
                            className="text-center py-8"
                        >
                            <p className="text-muted-foreground">No members found</p>
                        </motion.div>
                    )}
                </motion.div>
            </CardContent>
        </Card>
    );
};