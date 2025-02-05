import { Role } from '@prisma/client';
import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      role?: Role;
      provider?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role?: Role;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
    provider?: string;
  }
} 