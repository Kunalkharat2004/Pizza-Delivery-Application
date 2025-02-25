import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import { TenantController } from "../controllers/Tenantscontroller";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { Roles } from "../constants";
import canAccess from "../middlewares/canAccess";
import validateRequest from "../middlewares/validate-request";
import validateTenant from "../validator/tenant-validator";

const router = Router();

const tenantService = new TenantService();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantController = new TenantController(tenantService, tenantRepository, logger);

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  validateTenant,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => tenantController.create(req, res, next)
);

// List of all tenants
router.get("/", (req: Request, res: Response, next: NextFunction) => tenantController.listTenant(req, res, next));

// GET tenant by id
router.get("/:id", (req: Request, res: Response, next: NextFunction) => tenantController.getTenantById(req, res, next));

// PUT tenant by id
router.put(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  validateTenant,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => tenantController.updateTenant(req, res, next)
);

// DELETE tenant by id
router.delete("/:id", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) =>
  tenantController.deleteTenant(req, res, next)
);

export default router;
