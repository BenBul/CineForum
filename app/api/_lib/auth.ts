import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export type UserRole = "guest" | "user" | "admin";

export interface AuthContext {
  userId: string | null;
  role: UserRole;
  isAuthenticated: boolean;
}

/**
 * Get the authenticated user from the request
 * Uses the Authorization header to verify the JWT token
 */
export async function getAuthContext(
  request: NextRequest
): Promise<AuthContext> {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      userId: null,
      role: "guest",
      isAuthenticated: false,
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        userId: null,
        role: "guest",
        isAuthenticated: false,
      };
    }

    const userRole = (user.user_metadata?.role as UserRole) || "user";

    return {
      userId: user.id,
      role: userRole,
      isAuthenticated: true,
    };
  } catch (error) {
    return {
      userId: null,
      role: "guest",
      isAuthenticated: false,
    };
  }
}

/**
 * Check if user has permission to perform an action
 */
export function checkPermission(
  authContext: AuthContext,
  action: "read" | "create" | "update" | "delete",
  resourceOwnerId?: string | null
): boolean {
  // Guests can only read
  if (authContext.role === "guest") {
    return action === "read";
  }

  // Admins can do everything
  if (authContext.role === "admin") {
    return true;
  }

  // Users can read everything
  if (action === "read") {
    return true;
  }

  // Users can create
  if (action === "create") {
    return true;
  }

  // Users can update/delete their own resources
  if ((action === "update" || action === "delete") && resourceOwnerId) {
    return authContext.userId === resourceOwnerId;
  }

  return false;
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export function requireAuth(authContext: AuthContext): NextResponse | null {
  if (!authContext.isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Require specific role - returns 401 if not authenticated or 403 if insufficient permissions
 */
export function requireRole(
  authContext: AuthContext,
  allowedRoles: UserRole[]
): NextResponse | null {
  if (!authContext.isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(authContext.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Require permission - returns 401 if not authenticated or 403 if insufficient permissions
 */
export function requirePermission(
  authContext: AuthContext,
  action: "read" | "create" | "update" | "delete",
  resourceOwnerId?: string | null
): NextResponse | null {
  if (!checkPermission(authContext, action, resourceOwnerId)) {
    if (!authContext.isAuthenticated && action !== "read") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }
  return null;
}
