import { checkbox } from "@keystone-next/fields";

export const permissionFields = {
  canManagePosts: checkbox({
    defaultValue: false,
    label: "User can update and delete any post",
  }),
  canReadPosts: checkbox({
    defaultValue: true,
    label: "Any logged in user can read other posts",
  }),
  canManageEvents: checkbox({
    defaultValue: false,
    label: "User can update and delete any event",
  }),
  canReadEvents: checkbox({
    defaultValue: true,
    label: "Any logged in user can read other events",
  }),
  canSeeOtherUsers: checkbox({
    defaultValue: false,
    label: "User can see other users",
  }),
  canManageUsers: checkbox({
    defaultValue: false,
    label: "User can edit other users",
  }),
  canManageRoles: checkbox({
    defaultValue: false,
    label: "User can create, read, update, and delete roles",
  }),
};

export type Permission = keyof typeof permissionFields;

export const permissionsList: Permission[] = Object.keys(
  permissionFields
) as Permission[];
