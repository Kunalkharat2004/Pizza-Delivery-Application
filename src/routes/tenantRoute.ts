import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import { TenantController } from "../controllers/Tenantscontroller";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";

const router = Router();

const tenantService = new TenantService();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantController = new TenantController(tenantService, tenantRepository);

router.post("/", (req: Request, res: Response, next: NextFunction) => tenantController.create(req, res, next));

export default router;
