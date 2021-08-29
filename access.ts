import { Permission, permissionsList } from "./schemas/fields";
import { ListAccessArgs } from "./types";
// At it's simplest, the access control returns a yes or no value depending on the users session

export function isSignedIn({ session }: ListAccessArgs) {
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
) as Record<Permission, ({ session }: ListAccessArgs) => boolean>;

// Permissions check if someone meets a criteria - yes or no.
export const permissions = {
  ...generatedPermissions,
};

// Rule based function
// Rules can return a boolean - yes or no - or a filter which limits which products they can CRUD.
export const rules = {
  canManagePosts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManagePosts({ session })) {
      return true;
    }
    return { id: session?.itemId };
  },
  canOverseeUsers({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    return { id: session?.itemId };
  },
  canReadUsers({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canSeeOtherUsers({ session })) {
      return true;
    }
  },
  canOverseeRoles({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageRoles({ session })) {
      return true;
    }
    return { id: session?.itemId };
  },
  canOverseeEvents({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageEvents({ session })) {
      return true; // They can read everything!
    }
    // They should only see available products (based on the status field)
    return { id: session?.itemId };
  },
};
