import { AppDataSource } from "src/database/data.source";
import { Roles } from "src/roles/enums/roles";
import { RolesEntity } from "src/models/entities/roles.entity";

const rolesQueJaExistem: string[] = [];

async function generateDefaultRoles() {
  await AppDataSource.initialize();

  const rolesRepository = AppDataSource.getRepository(RolesEntity);

  const rolesValues = Object.values(Roles);

  for (const r of rolesValues) {
    const newRole = new RolesEntity();
    newRole.role = r as Roles;

    const exRole = await rolesRepository.findOne({
      where: {
        role: r as Roles,
      },
    });

    if (exRole) {
      rolesQueJaExistem.push(r);
      continue;
    }

    await rolesRepository.save(newRole);
  }
}

generateDefaultRoles()
  .then(() => {
    console.log("ROLES CRIADAS COM SUCESSO!");
    console.log("ROLES JÁ EXISTENTES: " + rolesQueJaExistem);
  })
  .catch((err) => {
    console.log("FALHA AO CRIAR ROLES PADRÕES!");
    console.error(err);
  })
  .finally(() => {
    AppDataSource.destroy();
  });