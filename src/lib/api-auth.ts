import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type ApiHandler = (
  req: Request | NextRequest,
  userId: string
) => Promise<NextResponse | Response>;

/**
 * Safely extracts the authenticated user ID from the request
 * Uses multiple methods to ensure we can get a user ID even if the primary session method fails
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    // Method 1: Try getting user from getServerSession
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      return session.user.id;
    }
    
    // Method 2: Try using getToken directly
    try {
      const headersList = headers();
      const cookieStore = cookies();
      
      const token = await getToken({ 
        req: {
          headers: Object.fromEntries(headersList.entries()),
          cookies: Object.fromEntries(
            cookieStore.getAll().map(c => [c.name, c.value])
          ),
        } as any,
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (token?.id) {
        return token.id as string;
      }
    } catch (tokenError) {
      console.error("Error getting token:", tokenError);
    }
    
    // If we got here, we couldn't find a user ID
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Wraps an API handler with authentication, ensuring the user is authenticated
 * before calling the handler function
 */
export function withAuth(handler: ApiHandler) {
  return async function(req: Request | NextRequest) {
    try {
      // Get authenticated user ID
      const userId = await getAuthenticatedUserId();
      
      if (!userId) {
        return NextResponse.json(
          { error: "Unauthorized - you must be logged in" },
          { status: 401 }
        );
      }
      
      // Call the handler with the authenticated userId
      return handler(req, userId);
    } catch (error) {
      console.error("Error in API auth wrapper:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
} 