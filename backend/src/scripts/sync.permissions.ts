import { AppDataSource } from "src/database/data.source";
import { Permissions } from "src/models/entities/permissions.entity";
import { PERMISSIONS } from "src/permissions/permissions.map";
import { RolesEntity } from "src/models/entities/roles.entity";

// Neste caso nosso sistema não cria as permissions direto no banco então o permission sync vai servir para preencher as novas permissions
// Mas caso precisasse gerenciar as locais criadas default com as do sistema esse script seria bem mais complexo
async function permissionsSync() {
    await AppDataSource.initialize();

    await AppDataSource.transaction(async (transactionalEntityManager) => {
        const permissionsRepository =
            transactionalEntityManager.getRepository(Permissions);
        const rolesRepository = transactionalEntityManager.getRepository(RolesEntity);

        // Remove todas as FK de Roles
        await transactionalEntityManager
            .createQueryBuilder()
            .relation(RolesEntity, "permissions")
            .of([])
            .remove({});

        await permissionsRepository.deleteAll();

        const permissionMapList = flattenPermissions(PERMISSIONS);

        // Recria todas as permissions e depois liga nas roles
        for (const { permission, roles } of permissionMapList) {
            const [subject, action] = permission.split(".");

            const newPermission = new Permissions();
            newPermission.subject = subject;
            newPermission.action = action;

            const savedPermission = await permissionsRepository.save(newPermission);

            for (const roleName of roles) {
                const r = await rolesRepository.findOne({
                    where: {
                        role: roleName,
                    },
                    relations: ["permissions"],
                });

                if (r) {
                    r.permissions.push(savedPermission);
                    await rolesRepository.save(r);
                }
            }
        }
    });
}

function flattenPermissions(perm: any) {
    const list: any = [];
    for (const moduleKey in perm) {
        for (const actionKey in perm[moduleKey]) {
            const p = perm[moduleKey][actionKey];
            list.push({
                permission: p.permissions,
                roles: p.roles,
            });
        }
    }
    return list;
}

permissionsSync()
    .then((res) => {
        console.log("PERMISSIONS SYNC RODOU COM SUCESSO!");
    })
    .catch((err) => {
        console.log("FALHA AO SINCRONIZAR AS PERMISSIONS!");
        console.error(err);
    })
    .finally(() => {
        AppDataSource.destroy();
    });