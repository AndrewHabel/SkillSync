"use client";

import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { saveGithubToken } from "../api/github-auth";


const githubTokenSchema = z.object({
  personalAccessToken: z.string().min(1, "Required"),
});

type GithubTokenFormValues = z.infer<typeof githubTokenSchema>;

export const GithubLoginCard = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<GithubTokenFormValues>({
    resolver: zodResolver(githubTokenSchema),
    defaultValues: {
      personalAccessToken: "",
    },
  });

  const onSubmit = async (values: GithubTokenFormValues) => {
    setIsPending(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await saveGithubToken(values.personalAccessToken);
      console.log("GitHub token saved successfully", result);
      setSuccess(true);
      // You can redirect or update state based on successful token validation
    } catch (err) {
      console.error("GitHub token validation failed", err);
      setError(err instanceof Error ? err.message : "Failed to validate GitHub token");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="auth-card w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7 ">
        <CardTitle className="text-2xl">
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Connect your GitHub account to access repositories
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <div className="mb-4 text-sm">
          <p>To connect your GitHub account, please provide a Personal Access Token (PAT) from GitHub.</p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-700">GitHub Token Settings</a></li>
            <li>Click "Generate new token" and select "Generate new token (classic)"</li>
            <li>Give it a name like "SkillSync Integration"</li>
            <li>Select scopes: <code>repo</code>, <code>read:user</code>, and <code>user:email</code></li>
            <li>Click "Generate token" and copy the token</li>
            <li>Paste the token below</li>
          </ol>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="personalAccessToken"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="GitHub Personal Access Token"
                      className="auth-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            {success && (
              <div className="text-green-500 text-sm">GitHub token saved successfully!</div>
            )}
            <Button disabled={isPending} size="lg" className="w-full">
              <FaGithub className="mr-2 size-5" />
              Connect GitHub
            </Button>
          </form>
        </Form>
      </CardContent>
      <div>
        <DottedSeparator className="px-7" />
      </div>
      <CardContent className="p-7 flex items-center justify-center">
        <p>
          Want to use OAuth instead?{" "}
          <Link href="/sign-in">
            <span className="text-blue-700">Go to Sign In</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};