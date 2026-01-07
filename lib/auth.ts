import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/lib/env"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: AUTH_SECRET,
  // PrismaAdapter optional - using JWT strategy, so we can make it optional
  adapter: process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            avatarUrl: true,
            username: true,
            bio: true
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarUrl,
            username: user.username,
            bio: user.bio
          }
        } catch (error) {
          console.error('Database error during login:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
      async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.bio = user.bio
      }

      // Session update trigger (when updateProfile is called)
      if (trigger === "update" && session) {
        try {
          // Fetch fresh user data from database
          const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            username: true,
            bio: true
          }
        })

        if (freshUser) {
          token.name = freshUser.name
          token.email = freshUser.email
          token.picture = freshUser.avatarUrl
            token.username = freshUser.username
            token.bio = freshUser.bio
          }
        } catch (error) {
          console.error('Database error during session update:', error)
          // Continue with existing token data
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string || null

        // Fetch username from database if not in token (for Google login or old sessions)
        if (!token.username && token.id) {
          try {
            const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { username: true, bio: true }
          })

          if (user) {
              session.user.username = user.username;
              session.user.bio = user.bio
            }
          } catch (error) {
            console.error('Database error during session fetch:', error)
            // Use token data as fallback
            session.user.username = token.username || undefined;
            session.user.bio = token.bio || undefined
          }
        } else {
          session.user.username = token.username;
          session.user.bio = token.bio
        }
      }
      return session
    }
  }
})
