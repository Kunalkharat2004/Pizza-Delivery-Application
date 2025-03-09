import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { ITenant } from "../types";
import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantRepository: Repository<Tenant>,
    private readonly logger: Logger
  ) {}
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body as ITenant;

      // Create a new tenant
      const tenant = await this.tenantService.createTenant({ name, address }, this.tenantRepository);

      this.logger.info(`Tenant created, id:${tenant.id}`);

      res.status(201).json({
        message: "Tenant created successfully",
        id: tenant.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  async listTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantRepository.find({});
      res.status(200).json(tenants);
    } catch (err) {
      next(err);
      return;
    }
  }

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.params.id;
      const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
      if (!tenant) {
        const error = createHttpError(404, "Tenant not found");
        next(error);
        return;
      }
      res.json(tenant);
    } catch (err) {
      next(err);
      return;
    }
  }

  async updateTenant(req: Request, response: Response, next: NextFunction) {
    try {
      const tenantId = req.params.id;
      const { name, address } = req.body as ITenant;
      const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
      if (!tenant) {
        const error = createHttpError(404, "Tenant not found");
        next(error);
        return;
      }
      tenant.name = name;
      tenant.address = address;
      await this.tenantRepository.save(tenant);
      response.json(tenant);
    } catch (err) {
      next(err);
      return;
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.params.id;
      const tenant = await this.tenantRepository.findOneBy({ id: tenantId });
      if (!tenant) {
        const error = createHttpError(404, "Tenant not found");
        next(error);
        return;
      }

      await this.tenantRepository.delete(tenant.id);

      res.json({
        message: "Tenant deleted successfully",
        id: tenant.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}
