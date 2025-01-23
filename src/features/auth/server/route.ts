import { Hono } from "hono"
import {zValidator} from "@hono/zod-validator"
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { AUTH_COOKIE } from "../constans";
import { setCookie } from "hono/cookie";
import { deleteCookie } from "hono/cookie";



const app = new Hono()
  .post(
    "/login", 
    zValidator("json",loginSchema),
  async (c) => {

    const {email,password} = c.req.valid("json");

    const adminClient = await createAdminClient();
    const account = adminClient.getAccount();
    const session = await account.createEmailPasswordSession(
      email,
      password,
    );

    setCookie(c , AUTH_COOKIE , session.secret ,{
      path:"/",
      httpOnly:true,
      secure:true,
      sameSite:"strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return c.json({success:true});
  }
  )
  .post(
    "/register",
    zValidator("json",registerSchema),
    async (c) => {

      const {name ,email,password} = c.req.valid("json");
      const adminClient = await createAdminClient();
      const account = adminClient.getAccount();

      const user = await account.create(
        ID.unique(),
        email,
        password,
        name,
      );

      const session = await account.createEmailPasswordSession(
        email,
        password,
      );

      setCookie(c , AUTH_COOKIE , session.secret ,{
        path:"/",
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge: 60 * 60 * 24 * 7,
      });
      return c.json({data:user});
    }
  )
  .post(
    "/logout", (c)=>{
    deleteCookie(c,AUTH_COOKIE);
    return c.json({success:true});
  });

export default app;