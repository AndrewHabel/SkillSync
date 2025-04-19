"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTeamSchema } from "../schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTeam } from "../api/use-create-team";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { 
  BarChartIcon, 
  CodeIcon, 
  ShieldIcon, 
  PenToolIcon, 
  ZapIcon, 
  TestTubeIcon, 
  ServerIcon, 
  DatabaseIcon, 
  CpuIcon, 
  BrainIcon, 
  SmartphoneIcon, 
  UsersIcon, 
  BeakerIcon, 
  BarChart3Icon
} from "lucide-react";

interface CreateTeamFormProps {
  onCancel?: () => void;
  projectOptions: { id: string, name: string, imageUrl: string }[];
  preSelectedProjectId?: string;
}

// Team type options with icons - updated to match schema
const teamTypes = [
  { id: "Data Analytics Team", name: "Data Analytics Team", icon: <BarChartIcon className="size-4 mr-2" /> },
  { id: "Frontend Team", name: "Frontend Team", icon: <CodeIcon className="size-4 mr-2" /> },
  { id: "Security Specialist Team", name: "Security Specialist Team", icon: <ShieldIcon className="size-4 mr-2" /> },
  { id: "User interface Team", name: "User interface Team", icon: <PenToolIcon className="size-4 mr-2" /> },
  { id: "Performance Engineer Team", name: "Performance Engineer Team", icon: <ZapIcon className="size-4 mr-2" /> },
  { id: "Tester Team", name: "Tester Team", icon: <TestTubeIcon className="size-4 mr-2" /> },
  { id: "Backend Team", name: "Backend Team", icon: <ServerIcon className="size-4 mr-2" /> },
  { id: "Database Administration Team", name: "Database Administration Team", icon: <DatabaseIcon className="size-4 mr-2" /> },
  { id: "DevOps Team", name: "DevOps Team", icon: <CpuIcon className="size-4 mr-2" /> },
  { id: "AI Specialist Team", name: "AI Specialist Team", icon: <BrainIcon className="size-4 mr-2" /> },
  { id: "Data Scientist Team", name: "Data Scientist Team", icon: <BeakerIcon className="size-4 mr-2" /> }
];

export const CreateTeamForm = ({ onCancel, projectOptions, preSelectedProjectId }: CreateTeamFormProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateTeam();

  const form = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      workspaceId,
      projectId: preSelectedProjectId || "",
      teamtype: undefined,
      membersId: []
    },
  });

  const onSubmit = (values: z.infer<typeof createTeamSchema>) => {
    mutate({ json: values }, {
      onSuccess: () => {
        form.reset();
        onCancel?.();
      }
    });
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new team
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Project
                    </FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-x-2">
                              <ProjectAvatar className="size-6" name={project.name} image={project.imageUrl} />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="teamtype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Team Type
                    </FormLabel>
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Team Type" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {teamTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center">
                              {type.icon}
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              {/* Custom type input that appears when other is selected (could be added in future) */}
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button type="button" size="lg" variant="secondary" onClick={onCancel} disabled={isPending} className={cn(!onCancel && "invisible")}>
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                Create Team
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};