import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"
import type { User } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "checkbox" } // YANGI
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email va parol kiritilishi kerak")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Email yoki parol noto'g'ri")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("Email yoki parol noto'g'ri")
        }

        // remember flagini user obyektiga qo'shamiz (keyin token ga o'tadi)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          remember: credentials.remember === "true" // stringdan booleanga
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.image = user.image
        token.remember = (user as any).remember // remember flagini token ga qo'shamiz
      }
      return token
    },
    async session({ session, token }) {
      // Sessiya muddatini remember ga qarab sozlaymiz
      if (token.remember) {
        session.maxAge = 30 * 24 * 60 * 60 // 30 kun
      } else {
        session.maxAge = 24 * 60 * 60 // 1 kun
      }
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role as string,
          image: token.image as string,
        }
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // default 1 kun (keyin callback orqali o'zgaradi)
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
