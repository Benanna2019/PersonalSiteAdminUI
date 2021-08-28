import { createSchema, list } from "@keystone-next/keystone/schema";
import { cloudinaryImage } from "@keystone-next/cloudinary";
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  checkbox,
} from "@keystone-next/fields";
import "dotenv/config";
import { document } from "@keystone-next/fields-document";
import { isSignedIn, permissions, rules } from "./access";
import { permissionFields } from "./schemas/fields";

export const cloudinary = {
  cloudName: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  apiKey: `${process.env.CLOUDINARY_KEY}`,
  apiSecret: `${process.env.CLOUDINARY_SECRET}`,
  folder: "Digital Garden Photos",
};

export const lists = createSchema({
  User: list({
    access: {
      create: () => true,
      read: rules.canOverseeUsers,
      update: rules.canOverseeUsers,
      // only people with the permission can delete themselves!
      // You can't delete yourself
      delete: permissions.canManageUsers,
    },
    ui: {
      // hide the backend UI from regular users
      hideCreate: (args) => !permissions.canManageUsers(args),
      hideDelete: (args) => !permissions.canManageUsers(args),
      listView: {
        initialColumns: ["name", "posts"],
      },
    },
    fields: {
      name: text({ isRequired: true }),
      email: text({ isRequired: true, isUnique: true }),
      password: password({ isRequired: true }),
      posts: relationship({ ref: "Post.author", many: true }),
      events: relationship({ ref: "Event.author" }),
      role: relationship({
        ref: "Role.assignedTo",
        access: {
          create: permissions.canManageUsers,
          update: permissions.canManageUsers,
        },
        ui: {
          itemView: {
            fieldMode: "read",
          },
        },
      }),
    },
  }),
  Post: list({
    access: {
      create: isSignedIn,
      read: rules.canReadPosts,
      update: rules.canManagePosts,
      delete: rules.canManagePosts,
    },
    fields: {
      title: text(),
      status: select({
        options: [
          { label: "Published", value: "published" },
          { label: "Draft", value: "draft" },
        ],
        ui: {
          displayMode: "segmented-control",
        },
      }),
      photo: relationship({
        ref: "PostImage.post",
        ui: {
          displayMode: "cards",
          cardFields: ["image", "altText"],
          inlineCreate: { fields: ["image", "altText"] },
          inlineEdit: { fields: ["image", "altText"] },
        },
      }),
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      publishDate: timestamp(),
      author: relationship({
        ref: "User.posts",
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineEdit: { fields: ["name", "email"] },
          linkToItem: true,
          inlineCreate: { fields: ["name", "email"] },
        },
      }),
      tags: relationship({
        ref: "Tag.posts",
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] },
        },
        many: true,
      }),
    },
  }),
  Tag: list({
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      posts: relationship({
        ref: "Post.tags",
        many: true,
      }),
      events: relationship({
        ref: "Event.tags",
        many: true,
      }),
    },
  }),
  PostImage: list({
    access: {
      create: isSignedIn,
      read: () => true,
      update: permissions.canManagePosts,
      delete: permissions.canManagePosts,
    },
    fields: {
      image: cloudinaryImage({
        cloudinary,
        label: "Source",
      }),
      altText: text(),
      post: relationship({ ref: "Post.photo" }),
    },
    ui: {
      listView: {
        initialColumns: ["image", "altText", "post"],
      },
    },
  }),
  Event: list({
    access: {
      create: isSignedIn,
      read: rules.canReadEvents,
      update: rules.canOverseeEvents,
      delete: rules.canOverseeEvents,
    },
    fields: {
      title: text(),
      status: select({
        options: [
          { label: "Published", value: "published" },
          { label: "Draft", value: "draft" },
        ],
        ui: {
          displayMode: "segmented-control",
        },
      }),
      photo: relationship({
        ref: "EventImage.event",
        ui: {
          displayMode: "cards",
          cardFields: ["image", "altText"],
          inlineCreate: { fields: ["image", "altText"] },
          inlineEdit: { fields: ["image", "altText"] },
        },
      }),
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      publishDate: timestamp(),
      eventDate: text(),
      author: relationship({
        ref: "User.events",
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineEdit: { fields: ["name", "email"] },
          linkToItem: true,
          inlineCreate: { fields: ["name", "email"] },
        },
      }),
      tags: relationship({
        ref: "Tag.events",
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] },
        },
        many: true,
      }),
    },
  }),
  EventImage: list({
    access: {
      create: isSignedIn,
      read: () => true,
      update: permissions.canManageEvents,
      delete: permissions.canManageEvents,
    },
    fields: {
      image: cloudinaryImage({
        cloudinary,
        label: "Source",
      }),
      altText: text(),
      event: relationship({ ref: "Event.photo" }),
    },
    ui: {
      listView: {
        initialColumns: ["image", "altText", "event"],
      },
    },
  }),
  Role: list({
    access: {
      create: permissions.canManageRoles,
      read: permissions.canManageRoles,
      update: permissions.canManageRoles,
      delete: permissions.canManageRoles,
    },
    ui: {
      hideCreate: (args) => !permissions.canManageRoles(args),
      hideDelete: (args) => !permissions.canManageRoles(args),
      isHidden: (args) => !permissions.canManageRoles(args),
    },
    fields: {
      name: text({ isRequired: true }),
      ...permissionFields,
      assignedTo: relationship({
        ref: "User.role", // TODO: Add this to the User
        many: true,
        ui: {
          itemView: { fieldMode: "read" },
        },
      }),
    },
  }),
});