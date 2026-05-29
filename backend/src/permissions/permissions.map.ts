import { Action } from "src/auth/casl/enums/casl.action";
import { Roles } from "src/roles/enums/roles";

export const PERMISSIONS = {
    manage: [
        {
            permissions: `manage.${Action.Manage}`,
            roles: [Roles.ADMIN]
        }
    ]
}