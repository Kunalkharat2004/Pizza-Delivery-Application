import { Repository, DataSource } from "typeorm";
import { Tenant } from "../entity/Tenant";
import createHttpError, { HttpError } from "http-errors";
import { ITenant, TenantQueryParams } from "../types";
import { User } from "../entity/User";
import { Roles } from "../constants";

export class TenantService {
  constructor(
    private readonly tenantRepository: Repository<Tenant>,
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource
  ) {}

  async createTenant({ name, address }: ITenant): Promise<Tenant> {
    try {
      const tenant = this.tenantRepository.create({ name, address });
      return await this.tenantRepository.save(tenant);
    } catch (err) {
      const error = createHttpError(500, "Failed to create tenant");
      throw error;
    }
  }

  async listTenants(validateQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");
    const searchQuery = `%${validateQuery.q}%`;
    if (validateQuery.q) {
      queryBuilder
        .where("tenant.name ILIKE :searchQuery", { searchQuery })
        .orWhere("tenant.address ILIKE :searchQuery", { searchQuery });
    }
    return await queryBuilder
      .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
      .take(validateQuery.perPage)
      .orderBy("tenant.createdAt", "DESC")
      .getManyAndCount();
  }

  async getManagersCount(tenantId: string): Promise<number> {
    return await this.userRepository.count({
      where: {
        tenant: { id: tenantId },
        role: Roles.MANAGER,
      },
    });
  }

  async deleteTenantWithManagers(tenantId: string, deleteManagers: boolean): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use queryRunner's manager for transactional operations
      const tenant = await queryRunner.manager.findOneBy(Tenant, { id: tenantId });
      if (!tenant) {
        throw createHttpError(404, "Tenant not found");
      }

      if (deleteManagers) {
        await queryRunner.manager.delete(User, {
          tenant: { id: tenantId },
          role: Roles.MANAGER,
        });
      }

      await queryRunner.manager.delete(Tenant, tenantId);

      await queryRunner.commitTransaction(); // Commit if all successful
    } catch (err) {
      await queryRunner.rollbackTransaction(); // Rollback on any error
      // Re-throw the error or handle it appropriately
      if (err instanceof HttpError) throw err; // Keep HTTP errors
      const error = err as Error;
      throw createHttpError(500, `Failed to delete tenant: ${error.message}`);
    } finally {
      await queryRunner.release(); // Always release the queryRunner
    }
  }
}
