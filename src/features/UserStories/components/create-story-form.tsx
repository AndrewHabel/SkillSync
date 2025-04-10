"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createUserStorySchema } from "../schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateStory } from "../api/use-create-story";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";


interface CreateStoryFormProps {
    onCancel?: () => void;
}

export const CreateStoryForm = ({onCancel}: CreateStoryFormProps) => {
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId();
    const {mutate:createStory, isPending} = useCreateStory();

    const form = useForm<z.infer<typeof createUserStorySchema>>({
        resolver: zodResolver(createUserStorySchema),
        defaultValues: {
            workspaceId,
            projectId,
        }
    })

    const onSubmit = (values: z.infer<typeof createUserStorySchema>) => {
        createStory({json: {...values , workspaceId}}, {
            onSuccess: ({data}) => {
                form.reset();
                onCancel?.();
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
          <CardHeader className="flex p-7">
            <CardTitle className="text-xl font-bold">
              Add a new User Story!
            </CardTitle>
          </CardHeader>
          <div className="px-7">
            <DottedSeparator />
          </div>
          <CardContent className="p-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-x-7 gap-y-5">
                    <FormField 
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                        Story Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Story description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> 

                    <FormField 
                      control={form.control}
                      name="AcceptanceCriteria"
                      render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                        Acceptance Criteria
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Acceptance criteria"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> 

                <DottedSeparator className="py-7" />
                <div className="flex items-center justify-between">
                <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                  Add User Story
                </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
    )
}
