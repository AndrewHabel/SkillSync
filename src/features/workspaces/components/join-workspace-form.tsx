"use client"
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code-id";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface JoinWorkspaceFormProps {
    initialValues: {
        name:string;
    }
}

export const JoinWorkspaceForm = ({ initialValues }:JoinWorkspaceFormProps) => {
    
    const workspaceId = useWorkspaceId();
    const {mutate , isPending} = useJoinWorkspace();
    const inviteCode = useInviteCode();
    const router = useRouter();

    const handleJoinWorkspace = async () => {
        console.log(workspaceId , inviteCode);
        await mutate({
            param:{workspaceId},
            json : {code:inviteCode}
        },{
            onSuccess:({data}) => {
                router.push(`/workspaces/${data.$id}`);
            },   
        });
    }

    return (
        <Card className="w-full h-full border-none shadow-none">

            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">Join Workspace</CardTitle>
                <CardDescription>You&apos;ve been invited to join <strong>{initialValues.name}</strong> Workspace </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">  
                    <Button className="w-full lg:w-fit" variant="secondary" type="button" size="lg" disabled={isPending}>
                        <Link href="/">
                            Cancel
                        </Link>
                    </Button>
                    <Button className="w-full lg:w-fit" type="button" size="lg" onClick={handleJoinWorkspace} disabled={isPending}>
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};