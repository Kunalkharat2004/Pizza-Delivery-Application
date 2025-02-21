import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { ITenant } from "../types";
import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { Logger } from "winston";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private tenantRepository: Repository<Tenant>,
    private logger: Logger
  ) {}
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body as ITenant;

      // Create a new tenant
      const tenant = await this.tenantService.createTenant({ name, address }, this.tenantRepository);

      this.logger.info(`Tenant created, id:${tenant.id}`);

      res.status(201).json({ message: "Tenant created successfully", tenant });
    } catch (err) {
      next(err);
      return;
    }
  }
}
