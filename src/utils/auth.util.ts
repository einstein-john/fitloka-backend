import { AuthenticatedUserRequest } from "../types";

/**
 * Check if the authenticated user can access a resource
 * Admins can access everything, regular users can only access their own resources
 * @param req - Authenticated request
 * @param resourceUserId - User ID that owns the resource
 * @returns true if user can access the resource, false otherwise
 */
export function canAccessResource(req: AuthenticatedUserRequest, resourceUserId: number): boolean {
  // Admins can access everything
  if (req.isAdmin) {
    return true;
  }

  // Regular users can only access their own resources
  return req.userId === resourceUserId;
}

/**
 * Check if the request is from an admin user
 * @param req - Authenticated request
 * @returns true if user is admin, false otherwise
 */
export function isAdmin(req: AuthenticatedUserRequest): boolean {
  return req.isAdmin === true;
}
