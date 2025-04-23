"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createUserStorySchema } from "../schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateStory } from "../api/use-create-story";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { motion } from "framer-motion";
import { VoiceInput } from "@/components/voice-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CreateStoryFormProps {
    onCancel?: () => void;
}

export const CreateStoryForm = ({onCancel}: CreateStoryFormProps) => {
    const workspaceId = useWorkspaceId();
    const projectId = useProjectId();
    const {mutate:createStory, isPending} = useCreateStory();
    const [listeningToDescription, setListeningToDescription] = useState(false);
    const [listeningToCriteria, setListeningToCriteria] = useState(false);

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

    // Handle voice input for description field
    const handleDescriptionVoiceInput = (text: string) => {
        form.setValue("description", text);
    };

    // Handle voice input for acceptance criteria field
    const handleCriteriaVoiceInput = (text: string) => {
        form.setValue("AcceptanceCriteria", text);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                duration: 0.4
            }
        },
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="w-full h-full border-none shadow-none">
            <motion.div variants={itemVariants}>
              <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                  Add a new User Story!
                </CardTitle>
              </CardHeader>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="px-7">
                <DottedSeparator />
              </div>
            </motion.div>
            <CardContent className="p-7">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <motion.div 
                    className="flex flex-col gap-6"
                    variants={containerVariants}
                  >
                    <motion.div variants={itemVariants}>
                      <FormField 
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="text-base font-medium">
                              Story Description
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <VoiceInput 
                                      onTextCaptured={handleDescriptionVoiceInput}
                                      isListening={listeningToDescription}
                                      setIsListening={setListeningToDescription}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Speak to write description</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Textarea
                                {...field}
                                placeholder="Story description"
                                className={cn(
                                  "min-h-[120px] transition-shadow duration-300 ease-in-out focus-within:shadow-lg focus-within:shadow-primary/20",
                                  listeningToDescription && "border-red-500 shadow-red-500/20 shadow-lg"
                                )}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                      /> 
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField 
                        control={form.control}
                        name="AcceptanceCriteria"
                        render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-1">
                            <FormLabel className="text-base font-medium">
                              Acceptance Criteria
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <VoiceInput 
                                      onTextCaptured={handleCriteriaVoiceInput}
                                      isListening={listeningToCriteria}
                                      setIsListening={setListeningToCriteria}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Speak to write acceptance criteria</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Textarea
                                {...field}
                                placeholder="Acceptance criteria"
                                className={cn(
                                  "min-h-[120px] transition-shadow duration-300 ease-in-out focus-within:shadow-lg focus-within:shadow-primary/20",
                                  listeningToCriteria && "border-red-500 shadow-red-500/20 shadow-lg"
                                )}
                              />
                            </motion.div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <DottedSeparator className="py-7" />
                  </motion.div>
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center justify-between"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        type="button" 
                        size="lg" 
                        variant="secondary" 
                        onClick={onCancel} 
                        disabled={isPending} 
                        className={cn(
                          !onCancel && "invisible",
                          "transition-all duration-300 hover:shadow-md"
                        )}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        type="submit" 
                        size="lg" 
                        disabled={isPending}
                        className="transition-all duration-300 hover:shadow-md"
                      >
                        Add User Story
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
    )
}
