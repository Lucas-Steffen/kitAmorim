import { Action } from "src/auth/casl/enums/casl.action";
import { Roles } from "src/roles/enums/roles";

export const PERMISSIONS = {
    manage: [
        {
            permissions: `manage.${Action.Manage}`,
            roles: [Roles.ADMIN]
        }
    ],
    users: [
        {
            permissions: `manage.${Action.Manage}`,
            roles: [Roles.ADMIN]
        },
        {
            permissions: `create.${Action.Create}`,
            roles: [Roles.ADMIN]
        },
        {
            permissions: `read.${Action.Read}`,
            roles: [Roles.ADMIN, Roles.USER]
        },
        {
            permissions: `update.${Action.Update}`,
            roles: [Roles.ADMIN, Roles.USER]
        },
        {
            permissions: `delete.${Action.Delete}`,
            roles: [Roles.ADMIN]
        }
    ]
}