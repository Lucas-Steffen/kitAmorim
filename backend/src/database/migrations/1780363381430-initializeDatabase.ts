import { MigrationInterface, QueryRunner } from "typeorm";

export class InitializeDatabase1780363381430 implements MigrationInterface {
    name = 'InitializeDatabase1780363381430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum" AS ENUM('manage', 'create', 'read', 'update', 'delete')`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "action" "public"."permissions_action_enum" NOT NULL, "subject" character varying NOT NULL, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."roles_entity_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "roles_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "role" "public"."roles_entity_role_enum" NOT NULL, CONSTRAINT "PK_d40adf1f0bda238c39fdbf8ab10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auth_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "code" character varying(6) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "user_id" uuid, CONSTRAINT "PK_b0101d71f5450e1c151191188ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles_entity_users_users" ("rolesEntityId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_33fd10602ccfebc09ea70d9ac50" PRIMARY KEY ("rolesEntityId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_496ad2c3ac595dbaeb7580a5e7" ON "roles_entity_users_users" ("rolesEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1cf63fb8bb927f9bf4834bb045" ON "roles_entity_users_users" ("usersId") `);
        await queryRunner.query(`CREATE TABLE "roles_entity_permissions_permissions" ("rolesEntityId" uuid NOT NULL, "permissionsId" uuid NOT NULL, CONSTRAINT "PK_0f0af0e8c937aa1ca2808a9555b" PRIMARY KEY ("rolesEntityId", "permissionsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cf1a0b229f4700fa4371697535" ON "roles_entity_permissions_permissions" ("rolesEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_41f1fff4af89770caa4b4ca87c" ON "roles_entity_permissions_permissions" ("permissionsId") `);
        await queryRunner.query(`ALTER TABLE "auth_codes" ADD CONSTRAINT "FK_27ebce5f8ac14b8d0cdd2d59577" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles_entity_users_users" ADD CONSTRAINT "FK_496ad2c3ac595dbaeb7580a5e7b" FOREIGN KEY ("rolesEntityId") REFERENCES "roles_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "roles_entity_users_users" ADD CONSTRAINT "FK_1cf63fb8bb927f9bf4834bb0458" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles_entity_permissions_permissions" ADD CONSTRAINT "FK_cf1a0b229f4700fa43716975351" FOREIGN KEY ("rolesEntityId") REFERENCES "roles_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "roles_entity_permissions_permissions" ADD CONSTRAINT "FK_41f1fff4af89770caa4b4ca87c7" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles_entity_permissions_permissions" DROP CONSTRAINT "FK_41f1fff4af89770caa4b4ca87c7"`);
        await queryRunner.query(`ALTER TABLE "roles_entity_permissions_permissions" DROP CONSTRAINT "FK_cf1a0b229f4700fa43716975351"`);
        await queryRunner.query(`ALTER TABLE "roles_entity_users_users" DROP CONSTRAINT "FK_1cf63fb8bb927f9bf4834bb0458"`);
        await queryRunner.query(`ALTER TABLE "roles_entity_users_users" DROP CONSTRAINT "FK_496ad2c3ac595dbaeb7580a5e7b"`);
        await queryRunner.query(`ALTER TABLE "auth_codes" DROP CONSTRAINT "FK_27ebce5f8ac14b8d0cdd2d59577"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41f1fff4af89770caa4b4ca87c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf1a0b229f4700fa4371697535"`);
        await queryRunner.query(`DROP TABLE "roles_entity_permissions_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1cf63fb8bb927f9bf4834bb045"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_496ad2c3ac595dbaeb7580a5e7"`);
        await queryRunner.query(`DROP TABLE "roles_entity_users_users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "auth_codes"`);
        await queryRunner.query(`DROP TABLE "roles_entity"`);
        await queryRunner.query(`DROP TYPE "public"."roles_entity_role_enum"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum"`);
    }

}
