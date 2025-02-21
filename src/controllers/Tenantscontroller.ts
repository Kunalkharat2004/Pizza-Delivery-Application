import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { ITenant } from "../types";
import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private tenantRepository: Repository<Tenant>
  ) {}
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body as ITenant;

      // Create a new tenant
      await this.tenantService.createTenant(name, address, this.tenantRepository);

      res.status(201).json({ message: "Tenant created successfully" });
    } catch (err) {
      next(err);
      return;
    }
  }
}
