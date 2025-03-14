import { authOptions } from "@/lib/auth-config";
import NextAuth from "next-auth/next";

// Using authOptions from separate config file to avoid build issues
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
