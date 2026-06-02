import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestInvites1748736000000 implements MigrationInterface {
  name = 'AddGuestInvites1748736000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."guest_invites_status_enum" AS ENUM('pending', 'used')`,
    );
    await queryRunner.query(
      `CREATE TABLE "guest_invites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "email" character varying NOT NULL,
        "code" character varying(8) NOT NULL,
        "status" "public"."guest_invites_status_enum" NOT NULL DEFAULT 'pending',
        "expiresAt" TIMESTAMP NOT NULL,
        "user_id" uuid,
        CONSTRAINT "PK_guest_invites" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "guest_invites"
        ADD CONSTRAINT "FK_guest_invites_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "guest_invites" DROP CONSTRAINT "FK_guest_invites_user"`,
    );
    await queryRunner.query(`DROP TABLE "guest_invites"`);
    await queryRunner.query(`DROP TYPE "public"."guest_invites_status_enum"`);
  }
}
