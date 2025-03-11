import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./prisma";

interface CustomUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: Role;
  onboardingCompleted: boolean;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "MENTEE",
          onboardingCompleted: false,
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            hashedPassword: true,
            role: true,
            onboardingCompleted: true,
          },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        } as CustomUser;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // For new users, create with Google profile data
          await db.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              image: user.image!,
              role: "MENTEE",
              onboardingCompleted: false,
            },
          });
        } else {
          // Update existing user's image if it's from Google
          await db.user.update({
            where: { email: user.email! },
            data: { 
              image: user.image,
              name: user.name // Also update name in case it changed
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      console.log('JWT callback - token:', token, 'user:', user); // Debug log
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (user) {
        const customUser = user as CustomUser;
        return {
          ...token,
          id: customUser.id,
          role: customUser.role,
          image: customUser.image,
          onboardingCompleted: customUser.onboardingCompleted,
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - token:', token); // Debug log
      
      // Check if token properties exist before assigning them
      if (!token) {
        console.log('Warning: token is undefined in session callback');
        return session;
      }
      
      return {
        ...session,
        user: {
          ...session.user,
          id: typeof token.id === 'string' ? token.id : "",
          role: token.role as Role || "MENTEE",
          image: typeof token.image === 'string' ? token.image : "",
          onboardingCompleted: typeof token.onboardingCompleted === 'boolean' ? token.onboardingCompleted : false,
        },
      };
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        if (url.includes('become-mentor')) {
          return `${baseUrl}/become-mentor/get-started`;
        }
        return url;
      }
      return baseUrl;
    },
  },
}; 