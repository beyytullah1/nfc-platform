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
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          emailVerified: new Date(), // Google accounts are pre-verified
          avatarUrl: profile.picture, // Map 'picture' to 'avatarUrl'
        }
      },
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
              passwordHash: true, // Şemada bu alan var
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
    async signIn({ user, account, profile }) {
      try {
        console.log('[signIn callback] Provider:', account?.provider, 'Email:', user.email)

        // If signing in with OAuth (Google)
        if (account?.provider === 'google') {
          console.log('[signIn callback] Google OAuth detected')

          // Check if user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          console.log('[signIn callback] Existing user:', existingUser?.id)

          if (existingUser) {
            // Check if this Google account is already linked
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: 'google',
                providerAccountId: account.providerAccountId
              }
            })

            console.log('[signIn callback] Existing account:', existingAccount?.id)

            if (!existingAccount) {
              console.log('[signIn callback] Creating new account link...')
              // Link the Google account to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                }
              })
              console.log('[signIn callback] Account linked successfully!')
            }
          }
        }

        console.log('[signIn callback] Returning true')
        return true
      } catch (error) {
        console.error('[signIn callback] ERROR:', error)
        return true // Still allow sign-in even if linking fails
      }
    },
    async jwt({ token, user, trigger, session, account }) {
      // On initial sign-in, user object is provided by the provider
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.role = 'user' // Default role for new users
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
              bio: true,
              role: true
            }
          })

          if (freshUser) {
            token.name = freshUser.name
            token.email = freshUser.email
            token.picture = freshUser.avatarUrl
            token.username = freshUser.username
            token.bio = freshUser.bio
            token.role = (freshUser as any).role || 'user'
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

        // Fetch username and role from database if not in token (for Google login or old sessions)
        if ((!token.username || !token.role) && token.id) {
          try {
            const user = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { username: true, bio: true, role: true }
            })

            if (user) {
              session.user.username = user.username;
              session.user.bio = user.bio
                ; (session.user as any).role = (user as any).role || 'user'
            }
          } catch (error) {
            console.error('Database error during session fetch:', error)
            // Use token data as fallback
            session.user.username = (token.username as string) || undefined;
            session.user.bio = (token.bio as string) || undefined
              ; (session.user as any).role = token.role || 'user'
          }
        } else {
          session.user.username = token.username as string | undefined;
          session.user.bio = token.bio as string | undefined
            ; (session.user as any).role = token.role || 'user'
        }
      }
      return session
    }
  }
})
