import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import createHttpError from "http-errors";
import { ITenant, TenantQueryParams } from "../types";

export class TenantService {
  constructor(private readonly tenantRepository: Repository<Tenant>) {}
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
    // const searchQuery = `%${validateQuery.q}%`;
    return await queryBuilder
      .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
      .take(validateQuery.perPage)
      .getManyAndCount();
  }
}
