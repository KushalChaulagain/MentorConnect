import { UserRole } from '@prisma/client';
import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
} 