import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      provider?: string;
      role: Role;
      id: string;
      onboardingCompleted: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    provider?: string;
    role: Role;
    id: string;
    hashedPassword?: string;
    onboardingCompleted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    provider?: string;
    onboardingCompleted?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.hashedPassword);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as 'MENTOR' | 'MENTEE',
          onboardingCompleted: user.onboardingCompleted,
        };
      }
    }),
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
          // Check if coming from become-mentor flow
          const isMentor = account?.provider === 'google' && 
            (account?.state as string)?.includes('role=mentor');
          
          // Create new user
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: isMentor ? 'MENTOR' : 'MENTEE', // Set role to MENTOR only if coming from mentor flow
              onboardingCompleted: false,
            },
          });
        }

        // Important: Add role and provider to user object
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
        token.onboardingCompleted = user.onboardingCompleted;
      }

      // Handle role updates during session
      if (trigger === 'update' && session?.user) {
        token.role = session.user.role;
        token.onboardingCompleted = session.user.onboardingCompleted;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.provider = token.provider as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If the url is an OAuth callback URL
      if (url.includes('/api/auth/callback/')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const callbackUrl = params.get('callbackUrl');
        
        if (callbackUrl) {
          return callbackUrl.startsWith(baseUrl) ? callbackUrl : baseUrl;
        }
        return baseUrl;
      }
      
      // If it's a relative URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // If it's the same origin
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