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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "boolean" } // qo'shimcha maydon
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

        // "remember" maydonini olish (frontenddan keladi)
        const remember = credentials.remember === 'true' || credentials.remember === true

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          remember, // maxsus maydon
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
        token.remember = (user as any).remember // remember flag'ini token'ga saqlash
      }
      return token
    },
    async session({ session, token }) {
      // Avval standart ma'lumotlarni o'rnatamiz
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
        image: token.image as string,
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
