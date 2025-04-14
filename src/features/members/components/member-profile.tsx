"use client";

import { use, useEffect, useRef, useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useMemberId } from "../hooks/use-member-id";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useGetMemberProfile } from "../api/use-get-member";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { UpdateMemberSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { DottedSeparator } from "@/components/dotted-separator";
import { useRouter } from "next/navigation";
import { useUpdateMember } from "../api/use-update-member"; 
import Image from "next/image";


export const MemberProfile = () => {

    const router = useRouter();
    const memberId = useMemberId();
    const workspaceId = useWorkspaceId();
    const { data } = useGetMemberProfile({ workspaceId, memberId });
    const { mutate: updateMember , isPending } = useUpdateMember(); 

    const inputRef = useRef<HTMLInputElement>(null);


    const form = useForm<z.infer<typeof UpdateMemberSchema>>({
        resolver: zodResolver(UpdateMemberSchema),
        defaultValues: {
            name: data?.name,
            skills: data?.skills.join(", "), 
        },
    });

    useEffect(() => {
        if (data) {
            form.reset({ 
                name: data.name,
                skills: data.skills.join(", "),
            });
        }
    }, [data, form.reset]);

    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        form.reset(); // Reset to initial value
        setIsEditing(false);
    };

    if (!data ) {
        return <div>Loading...</div>;
    }

    const onSubmit = async (values: z.infer<typeof UpdateMemberSchema> ) => {
        const finalValues = {
            ...values,
            skills : values.skills.join(","),
            image: values.image instanceof File ? values.image : "",
          } 
          updateMember({ form: finalValues , param:{memberId:data.id}}, {
           
          });
        setIsEditing(false);
    };
    
    const handelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) { 
          form.setValue("image", file)
        }
    }

    return (
        <div className="flex flex-col gap-y-4">
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button size="sm" variant="secondary" onClick={() => router.push(`/workspaces/${workspaceId}`)}>
                        <ArrowLeftIcon className="size-4px mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        Welcome to your profile page
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="w-full h-full border shadow-md bg-card">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Profile Details</h3>
                        <DottedSeparator className="py-7" />
                        
                        {!isEditing ? (
                            <div className="flex flex-col justify-between gap-3 p-5 rounded-lg members-list-bg">
                                <Image className="h-52 w-52 border-4 border-primary rounded-2xl" src={data?.image||"/male-user-icon-vector-8865469.jpg"} alt="logo" width={165} height={48} />
                                <p className="text-lg font-bold text-primary">Name: <span className="text-foreground font-normal">{data?.name}</span></p>
                                <p className="text-lg font-bold text-primary">Email: <span className="text-foreground font-normal">{data?.email}</span></p>
                                <p className="text-lg font-bold text-primary">Role: <span className="text-foreground font-normal">{data?.role.toLowerCase()}</span></p>
                                <p className="text-lg font-bold text-primary">Skills: <span className="text-foreground font-normal">{data?.skills.join(" , ")}</span></p>
                                <DottedSeparator className="py-7" />
                                <div className="flex justify-end">
                                    <Button className="w-28" size="sm" onClick={handleEdit}>
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5 rounded-lg members-list-bg">
                                <FormField 
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                    <div className="flex flex-col gap-y-2">
                                        <div className="flex items-center gap-x-5">
                                        {field.value ? (
                                            <div className="h-52 w-52 relative rounded-md overflow-hidden">
                                                <Image
                                                alt="Logo"
                                                fill
                                                className="h-52 w-52 border-4 border-primary rounded-2xl" 
                                                src={
                                                    field.value instanceof File
                                                    ? URL.createObjectURL(field.value)
                                                    : field.value
                                                }
                                                />
                                            </div>
                                            ) : (
                                            <Image className="h-52 w-52 border-4 border-primary rounded-2xl" src={data?.image||"/male-user-icon-vector-8865469.jpg"} alt="logo" width={165} height={48} />
                                            )
                                        }
                                        <div className="flex flex-col">
                                            <p className="text-sm">Workspace Icon</p>
                                            <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG & max 1MB</p>
                                            <Input 
                                            className="hidden"
                                            type="file"
                                            accept=".jpg, .png, .svg, .jpeg"
                                            ref={inputRef}
                                            onChange={handelImageChange}
                                            disabled={isPending}
                                            />
                                            {
                                            field.value ? (
                                                <Button type="button" disabled={isPending} variant="destructive" size="xs" className="w-fit mt-2" onClick={() => {
                                                field.onChange(null);
                                                if(inputRef.current) {
                                                    inputRef.current.value = "";
                                                }
                                                }} >
                                                remove Image
                                                </Button>
                                            ):(
                                                <Button type="button" disabled={isPending} variant="outline" size="xs" className="w-fit mt-2" onClick={() => inputRef.current?.click()} >
                                                Upload Image
                                                </Button>
                                            )
                                            }
                                        </div>
                                        </div>
                                    </div>
                                    )} 
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Member name" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="skills"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skills</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Member skills (comma separated)" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DottedSeparator className="py-7" />
                                <div className="flex items-center justify-end gap-4">
                                    <Button type="button" size="sm" variant="secondary" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm">
                                        Confirm
                                    </Button>
                                </div>
                            </form>
                        </Form>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};