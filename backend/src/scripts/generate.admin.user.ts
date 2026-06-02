import { AppDataSource } from "src/database/data.source";
import { RolesEntity } from "src/models/entities/roles.entity";
import { Users } from "src/models/entities/users.entity";
import { Roles } from "src/roles/enums/roles";
import * as bcrypt from "bcrypt";

async function generateAdminUser() {
    await AppDataSource.initialize();

    const usersRepository = AppDataSource.getRepository(Users)
    const rolesRepository = AppDataSource.getRepository(RolesEntity)

    const existsAdminUser = await usersRepository.findOne({
        where: {
            email: process.env.ADMIN_EMAIL!
        }
    });

    if (!existsAdminUser) {
        await adminUser(rolesRepository, usersRepository);
    }

    return;
}

async function adminUser(rolesRepository, usersRepository) {
    const existsRoles = await rolesRepository.findOne({
        where: {
            role: Roles.ADMIN
        }
    })

    if (!existsRoles) {
        throw new Error("Role de admin ainda não foi criada!");
    }

    const usuarioAdmin = new Users();

    const criptPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD!,
        +process.env.BCRYPT_SALT!,
    );

    usuarioAdmin.name = process.env.ADMIN_NAME!;
    usuarioAdmin.email = process.env.ADMIN_EMAIL!;
    usuarioAdmin.password = criptPassword;
    usuarioAdmin.roles = [existsRoles];

    await usersRepository.save(usuarioAdmin);
}

generateAdminUser().then(() => {
    console.log("Admin user generated successfully!");
    process.exit(0);
})
    .catch((err) => {
        console.log("Error generating admin user:", err);
        process.exit(1);
    })
    .finally(() => {
        AppDataSource.destroy();
    })