import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import { TenantController } from "../controllers/Tenantscontroller";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";

const router = Router();

const tenantService = new TenantService();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantController = new TenantController(tenantService, tenantRepository, logger);

router.post("/", authenticate, (req: Request, res: Response, next: NextFunction) =>
  tenantController.create(req, res, next)
);

export default router;
