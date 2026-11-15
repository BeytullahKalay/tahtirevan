import type { Access, CollectionConfig, FieldAccess } from "payload";
import { L } from "../shared";

type U = { id: number | string; role?: "admin" | "editor" } | null | undefined;
const isAdmin = (u: U) => u?.role === "admin";

const adminOnly: Access = ({ req }) => isAdmin(req.user as U);
const adminOrSelf: Access = ({ req }) => (isAdmin(req.user as U) ? true : req.user ? { id: { equals: req.user.id } } : false);
const adminField: FieldAccess = ({ req }) => isAdmin(req.user as U);

/**
 * Panel kullanıcıları. İlk açılışta oluşturulan hesap yönetici olur.
 * Yönetici: her şey + kullanıcılar. Editör: içerik, ama kullanıcı ekleyemez/rol değiştiremez.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: L("Kullanıcı", "User"), plural: L("Kullanıcılar", "Users") },
  auth: { tokenExpiration: 60 * 60 * 24 * 7, maxLoginAttempts: 8, lockTime: 15 * 60 * 1000 },
  admin: { useAsTitle: "email", group: L("Ayarlar", "Settings"), defaultColumns: ["name", "email", "role"] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: adminOnly,
    update: adminOrSelf,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // İlk kullanıcı her zaman yönetici olur
        if (operation === "create") {
          const count = await req.payload.count({ collection: "users", req });
          if (count.totalDocs === 0) data.role = "admin";
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", label: L("Ad soyad", "Name") },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      label: L("Rol", "Role"),
      options: [
        { label: L("Yönetici", "Admin"), value: "admin" },
        { label: L("Editör", "Editor"), value: "editor" },
      ],
      access: { update: adminField },
      admin: {
        position: "sidebar",
        description: L("Editör içerik düzenler; kullanıcıları yalnızca yönetici yönetir.", "Editors edit content; only admins manage users."),
      },
    },
  ],
};
