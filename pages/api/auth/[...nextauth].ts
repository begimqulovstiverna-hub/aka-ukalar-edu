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
import type { User as NextAuthUser } from "next-auth"

// TypeScript tiplarini kengaytiramiz
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
      image?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    role: string
    image?: string | null
    remember?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    image?: string | null
    remember?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Har safar akkaunt tanlash oynasi chiqadi
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "boolean" }
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

        // "remember" maydoni string sifatida keladi ("true" yoki "false")
        const remember = credentials.remember === 'true'

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          remember,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.image = user.image
        token.remember = (user as any).remember
      }
      return token
    },
    async session({ session, token }) {
      // Session user'ini kengaytirilgan tip bilan to'ldiramiz
      session.user = {
        id: token.id as string,
        role: token.role as string,
        image: token.image,
        name: session.user?.name,
        email: session.user?.email,
      }

      // Sessiya muddatini token.remember ga qarab sozlaymiz
      const now = Date.now()
      if (token.remember) {
        // 30 kun
        session.expires = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString()
      } else {
        // 1 kun
        session.expires = new Date(now + 24 * 60 * 60 * 1000).toISOString()
      }

      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
