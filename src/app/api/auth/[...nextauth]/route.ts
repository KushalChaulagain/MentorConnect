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

  interface User {
    provider?: string;
    role?: 'MENTOR' | 'MENTEE';
    id?: string;
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
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          // Get role from URL parameters
          const searchParams = new URLSearchParams(account?.state as string);
          const isMentor = searchParams.get('role') === 'mentor';
          
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
        }

        // Add role and provider to user object
        user.role = dbUser.role as 'MENTOR' | 'MENTEE';
        user.id = dbUser.id;
        user.provider = account?.provider;

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.provider = user.provider;
      }

      // Handle role updates during session
      if (trigger === 'update' && session?.user?.role) {
        token.role = session.user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'MENTOR' | 'MENTEE';
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle OAuth callback URLs
      if (url.includes('/api/auth/callback/')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const role = params.get('role');
        
        if (role === 'mentor') {
          return `${baseUrl}/become-mentor/get-started`;
        }
        
        return `${baseUrl}/dashboard/mentee`;
      }
      
      // Handle direct navigation to protected pages
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
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

