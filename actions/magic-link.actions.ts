"use server";
import { db } from "@/lib/database/adapter/db";
import { SignInSchema } from "@/types";
import { generateId } from "lucia";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email";

const generateMagicLink = async (email: string, userId: string) => {
  const token = jwt.sign({ email: email, userId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  });

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/magic-link?token=${token}`;

  return {
    success: true,
    message: "Magic link generated successfully",
    data: {
      token,
      url,
    },
  };
};

export const signIn = async (values: z.infer<typeof SignInSchema>) => {
  try {
    SignInSchema.parse(values);

    const existedUser = await db.users.findUnique({
      where: { email: values.email },
    });

    if (existedUser) {
      const res = await generateMagicLink(values.email, existedUser.id);

      await db.magicLink.create({
        data: {
          userId: existedUser.id,
          token: res.data.token,
        },
      });
      await sendEmail({
        to: values.email,
        subject: "signup link",
        html: `<div>click to sign up ${res.data.url}</div>`,
      });
    } else {
      // we will create the user
      const userId = generateId(15);

      await db.users.create({
        data: {
          email: values.email,
          id: userId,
        },
      });
      const res = await generateMagicLink(values.email, userId);

      await db.magicLink.create({
        data: {
          userId,
          token: res.data.token,
        },
      });

      await sendEmail({
        to: values.email,
        subject: "signup link",
        html: `<div>click to sign up ${res.data.url}</div>`,
      });
    }

    return {
      success: true,
      message: "Magic link sent successfully",
      data: null,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message,
      data: null,
    };
  }
};
