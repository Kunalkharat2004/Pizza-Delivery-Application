import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeleteCascadeToRefreshToken1740582200388 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing foreign key constraint
    await queryRunner.query(`ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`);

    // Add the new foreign key with ON DELETE CASCADE
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" 
       FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Drop the CASCADE foreign key constraint
    await queryRunner.query(`ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`);

    // Restore the original foreign key without CASCADE
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" 
       FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
