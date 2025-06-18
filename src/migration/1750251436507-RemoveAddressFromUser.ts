import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAddressFromUser1750251436507 implements MigrationInterface {
  name = "RemoveAddressFromUser1750251436507";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying NOT NULL`);
  }
}
