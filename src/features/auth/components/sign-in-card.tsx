"use client";

import {FcGoogle} from "react-icons/fc";
import {FaGithub} from "react-icons/fa";

import Link from "next/link"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";


export const SignInCard = () => {

  const {mutate , isPending} = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    console.log(values);
    mutate({json:values});
  };

  return (
    <Card className="auth-card w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7 ">
        <CardTitle className="text-2xl" >
          Welcome back!
        </CardTitle>
        <CardDescription>
          Login to get back into action!
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="E-mail"
                      className="auth-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField
              name="password"
              control={form.control}
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Password"
                      className="auth-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <Button disabled={isPending} size="lg" className="w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button onClick={() => signUpWithGoogle()} disabled={isPending} variant="secondary" size="lg" className="w-full auth-oauth-button">
          <FcGoogle className="mr-2 size-5" />
          Login with Google
        </Button>
        <Button onClick={() => signUpWithGithub()} disabled={isPending} variant="secondary" size="lg" className="w-full auth-oauth-button">
          <FaGithub className="mr-2 size-5" />
          Login with Github
        </Button>
      </CardContent>
      <div>
        <DottedSeparator className="px-7"/>
      </div>
      <CardContent className="p-7 flex items-center justify-center">
        <p>
          Don&apos;t have an account?
          <Link href="/sign-up">
              <span className="text-blue-700"> Sign Up</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}