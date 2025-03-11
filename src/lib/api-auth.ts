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
    console.log("Session from getServerSession:", JSON.stringify(session, null, 2));
    
    if (session?.user?.id) {
      console.log("User ID from session:", session.user.id);
      return session.user.id;
    }
    
    // Method 2: Try using getToken directly
    try {
      const headersList = headers();
      const cookieStore = cookies();
      
      // Explicitly log available cookies for debugging
      console.log("Available cookies:", cookieStore.getAll().map(c => c.name));
      
      const token = await getToken({ 
        req: {
          headers: Object.fromEntries(headersList.entries()),
          cookies: Object.fromEntries(
            cookieStore.getAll().map(c => [c.name, c.value])
          ),
        } as any,
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      console.log("Token from getToken:", token);
      
      if (token?.id) {
        console.log("User ID from token:", token.id);
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
    console.log(`API request received: ${req.method} ${req.url}`);
    
    try {
      // Get authenticated user ID
      const userId = await getAuthenticatedUserId();
      
      if (!userId) {
        console.log("Unauthorized access - no valid userId found");
        return NextResponse.json(
          { error: "Unauthorized - you must be logged in" },
          { status: 401 }
        );
      }
      
      // User is authenticated, call the handler
      return await handler(req, userId);
    } catch (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { 
          error: "Internal server error", 
          details: error instanceof Error ? error.message : "Unknown error" 
        },
        { status: 500 }
      );
    }
  };
} 