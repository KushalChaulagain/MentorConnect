import { prisma } from "@/lib/prisma";
import { DefaultSession, NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      provider?: string;
      role?: 'MENTOR' | 'MENTEE';
      id?: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          // Get role from URL parameters
          const searchParams = new URLSearchParams(account?.access_token || '');
          const isMentor = searchParams.get('mentor') === 'true';
          
          // Create new user
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: isMentor ? 'MENTOR' : 'MENTEE',
              onboardingCompleted: false,
            },
          });

          // Create account link
          if (account) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        // Fetch user from database to get role
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'MENTOR' | 'MENTEE';
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle OAuth callback URLs
      if (url.includes('/api/auth/callback/')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const callbackUrl = params.get('callbackUrl');
        const isMentor = callbackUrl?.includes('type=mentor');
        
        if (isMentor) {
          return `${baseUrl}/become-mentor/get-started`;
        }
        return `${baseUrl}/dashboard/mentee`;
      }
      
      // For all other URLs within our domain, keep them as is
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

