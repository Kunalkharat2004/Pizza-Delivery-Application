/* eslint-disable @typescript-eslint/no-unused-vars */
import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import createHttpError from "http-errors";

export class TenantService {
  constructor() {}

  async createTenant(name: string, address: string, tenantRepository: Repository<Tenant>): Promise<Tenant> {
    try {
      const tenant = tenantRepository.create({ name, address });
      return await tenantRepository.save(tenant);
    } catch (err) {
      const error = createHttpError(500, "Failed to create tenant");
      throw error;
    }
  }
}
