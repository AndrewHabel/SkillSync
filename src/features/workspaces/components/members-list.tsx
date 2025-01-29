"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
}from "@/components/ui/card"
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import {ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
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
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";

export const MembersList = () => {

    const workspaceId = useWorkspaceId();
    const { data } = useGetMembers({workspaceId});
    const {mutate:deleteMember ,isPending:isDeleteingMember} = useDeleteMember();
    const {mutate:updateMember ,isPending:isUpdatingMember} = useUpdateMember();
    const [ConfirmDialog,confirm] = useConfirm(
        "Remove Member",
        "Are you sure you want to remove this member?",
        "destructive"
    );

    const handelDeleteMember = async (memberId:string) => {
        const ok = await confirm();
        if(!ok) return;

        deleteMember({param:{memberId}},{
            onSuccess:()=>{
                window.location.reload();
            },
        });
    }

    const handelUpdateMember = async (memberId:string , role:MemberRole) => {
        updateMember({
            json:{role},
            param:{memberId}
        })
    }


    return (
        <Card className='w-full h-full border-none shadow-none'>
            <ConfirmDialog/>
            <CardHeader className="flex flex-row items-center gap-x-4  p-7 space-y-0 ">
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
            <div className="px-7"> 
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                {data?.documents.map((member,index) => (
                    <Fragment key={member.$id}>
                        <div className="flex items-center gap-2">
                            <MembersAvatar
                                className="size-10"
                                fallbackclassName="text-lg"
                                name={member.name}
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-forground">{member.email}</p>
                                <p className="text-xs text-muted-forground">{member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="ml-auto" variant="secondary" size="icon">
                                        <MoreVerticalIcon className="size-4 text-muted-forground"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" align="start">
                                    <DropdownMenuItem className="font-medium" onClick={()=>{handelUpdateMember(member.$id,MemberRole.ADMIN)}} disabled={isUpdatingMember}>Set As Adminstrator</DropdownMenuItem>
                                    <DropdownMenuItem className="font-medium" onClick={()=>{handelUpdateMember(member.$id,MemberRole.MEMBER)}} disabled={isUpdatingMember}>Set As Member</DropdownMenuItem>
                                    <DropdownMenuItem className="font-medium text-amber-700" onClick={()=>{handelDeleteMember(member.$id)}} disabled={isDeleteingMember}>Remove {member.name}</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {index !== data.documents.length - 1 && (
                            <div className="mt-4">
                                <Separator className="my-2.5 "/>
                            </div>
                        )}
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    );  
};