"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useInviteEmail } from "../api/use-invite-email";

const inviteUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

interface InviteUserFormProps {
  onCancel?: () => void;
  workspaceName: string;
  workspaceOwner: string;
  inviteCode: string;
}

export const InviteUserForm = ({ 
  onCancel, 
  workspaceName, 
  workspaceOwner,
  inviteCode 
}: InviteUserFormProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { mutate: sendInvitation, isPending } = useInviteEmail(workspaceId);

  const form = useForm<z.infer<typeof inviteUserSchema>>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof inviteUserSchema>) => {
    sendInvitation(
      { 
        email: values.email, 
        name: values.name 
      },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${values.email}`);
          form.reset();
          if (onCancel) onCancel();
        }
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Invite User to Workspace
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      User Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter user name"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter email address"
                        type="email"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};