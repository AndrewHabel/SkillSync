import { Hono } from "hono"
import {zValidator} from "@hono/zod-validator"
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { AUTH_COOKIE } from "../constans";
import { setCookie } from "hono/cookie";
import { deleteCookie } from "hono/cookie";
import { sessionMiddleware } from "@/lib/session-middleware";
import { sendWelcomeEmail } from "@/lib/sendEmail";



const app = new Hono()

  .get("/current", sessionMiddleware, (c) => {
    const user = c.get("user")
    return c.json({data: user })
  })
  .post(
    "/login", 
    zValidator("json",loginSchema),
  async (c) => {

    const {email,password} = c.req.valid("json");

    const adminClient = await createAdminClient();
    const account = adminClient.account;
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
      const account = adminClient.account;

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
      
      await sendWelcomeEmail(email, name);
      
      return c.json({data:user});
    }
  )
  .post("/logout", sessionMiddleware, async (c)=>{
    const account = c.get("account")


    deleteCookie(c,AUTH_COOKIE);

    await account.deleteSession("current");
    return c.json({success:true});
  });

export default app;