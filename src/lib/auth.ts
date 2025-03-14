import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-config";

// Re-export authOptions for backward compatibility
export { authOptions };

// Helper function to get the session on the server
export async function auth() {
  return await getServerSession(authOptions);
} 