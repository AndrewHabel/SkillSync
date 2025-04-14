"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateworkspaceSchema } from "../schema";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { on } from "events";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { Arrow } from "@radix-ui/react-dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code-workspace";

interface EditWorkspaceFormProps {
  onCancel?: () => void;
  initialValues:Workspace;
}

export const EditWorkspaceForm = ({ onCancel , initialValues}: EditWorkspaceFormProps) => {

  const router = useRouter();

  const {mutate, isPending} = useUpdateWorkspace();

  const {mutate:resetInviteCode, isPending:isResetingInviteCode} = useResetInviteCode();

  const {mutate:deleteWorkspace, 
    isPending:isDeleteingWorkspace} = useDeleteWorkspace();

  const [DeleteConfirmationDialog, confirmDelete] = useConfirm("Delete Workspace", "Are you sure you want to delete this workspace?", "destructive");

  const [ResetDialog, confirmReset] = useConfirm("Reset Workspace current Invite link", "Are you sure you want to Reset Workspace current Invite link?", "destructive");

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateworkspaceSchema>>({
    resolver: zodResolver(updateworkspaceSchema),
    defaultValues: {
      ...initialValues,
      image:initialValues.imageUrl ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof updateworkspaceSchema> ) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    } 
    mutate({ form: finalValues , param:{workspaceId:initialValues.$id}}, {
    });
  };

  const handelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) { 
      form.setValue("image", file)
    }
  }

  const handelDelete = async () => {
    const ok = await confirmDelete();
    if(!ok) return;
    deleteWorkspace({param : {workspaceId:initialValues.$id},}, {
      onSuccess: () => {
        window.location.href = "/";
      }
    });
  };


  const handelResetInviteCode = async () => {
    const ok = await confirmReset();
    if(!ok) return;
    resetInviteCode({param : {workspaceId:initialValues.$id},}, {
    });
  };


  const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

  const handelCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteLink)
      .then(() => toast.success("Invite link copied to clipboard"))
  }

  return(
    <div className="flex flex-col gap-y-4">
      <DeleteConfirmationDialog />
      <ResetDialog />
      
      <Card className="w-full h-full bg-muted shadow border border-border">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
            <ArrowLeftIcon className="size-4px mr-2" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
          </CardTitle>
        </CardHeader>      
      </Card>

      <Card className="w-full h-full bg-muted shadow border border-border">
      <CardContent className="p-7">
      <div className="flex flex-col">
            <h3 className="font-bold">Edit Workspace</h3>
            <p className="text-sm text-muted-foreground">
            </p>
            <DottedSeparator className="py-7" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Workspace Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Workspace name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                          <div className="size-[72px] relative rounded-md overflow-hidden">
                            <Image
                              alt="Logo"
                              fill
                              className="object-cover" 
                              src={
                                field.value instanceof File
                                ? URL.createObjectURL(field.value)
                                : field.value
                              }
                            />
                          </div>
                        ) : (
                          <Avatar className="size-[72px]">
                            <AvatarFallback>
                              <ImageIcon className="size-[36px] text-neutral-400" />
                            </AvatarFallback>
                          </Avatar>
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
                            <Button type="button" disabled={isPending} variant="secondary" size="xs" className="w-fit mt-2" onClick={() => inputRef.current?.click()} >
                              Upload Image
                            </Button>
                          )
                        }
                      </div>
                    </div>
                  </div>
                )} 
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
                <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                  Save Changes
                </Button>
            </div>
          </form>
        </Form>
      </div>
      </CardContent>
      </Card>

      <Card className="w-full h-full bg-muted shadow border border-border">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Invite Members</h3>
            <p className="text-sm text-muted-foreground">
              Use Invite link to invite members to this workspace
            </p>
            <DottedSeparator className="py-7" />
            <div className="mt-4">
              <div className="flex items-center gap-x-2">
                <Input disabled value={fullInviteLink}/>
                  <Button className="size-12" variant={"secondary"} onClick={handelCopyInviteLink} >
                    <CopyIcon className="size-5"/>
                  </Button>
              </div>
            </div>
            <DottedSeparator className="py-7" />
            <Button className="mt-6 w-fit ml-auto" size="sm" variant="destructive" type="button" disabled={isPending || isResetingInviteCode} onClick={handelResetInviteCode}>
              Reset Invite Link
            </Button>
          </div>
        </CardContent>       
      </Card>

      <Card className="w-full h-full bg-muted shadow border border-border">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Delete Workspace</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a workspace is irreversible. All associated data will be lost.
            </p> 
            <DottedSeparator className="py-7" />
            <Button className="mt-6 w-fit ml-auto" size="sm" variant="destructive" type="button" disabled={isPending || isDeleteingWorkspace} onClick={handelDelete}>
              Delete Workspace
            </Button>
          </div>
        </CardContent>       
      </Card>
      
  </div>
  )
};