import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { ITenant, TenantQueryParams } from "../types";
import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { matchedData } from "express-validator";

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
      const tenant = await this.tenantService.createTenant({ name, address });

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
      const validateQuery = matchedData(req, { onlyValidData: true });
      const [tenants, count] = await this.tenantService.listTenants(validateQuery as TenantQueryParams);
      res.status(200).json({
        data: tenants,
        total: count,
        currentPage: validateQuery.page as number,
        perPage: validateQuery.limit as number,
      });
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

  // Get managers count by tenant id
  async getManagersCount(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.params.id;
      const managersCount = await this.tenantService.getManagersCount(tenantId);
      res.json({
        message: "Managers count fetched successfully",
        count: managersCount,
      });
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
      const deleteManagers = req.query.deleteManagers === "true";

      await this.tenantService.deleteTenantWithManagers(tenantId, deleteManagers);

      res.json({
        message: "Tenant deleted successfully",
        id: tenantId,
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}
