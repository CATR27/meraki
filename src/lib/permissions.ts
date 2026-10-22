import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// Compartido por servidor y cliente: roles de Meraki para el plugin admin de Better Auth.
export const ac = createAccessControl(defaultStatements);

export const roles = {
  admin: ac.newRole({ ...adminAc.statements }),
  psicologo: ac.newRole({ user: [], session: [] }),
};
