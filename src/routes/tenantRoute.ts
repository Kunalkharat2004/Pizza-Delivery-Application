import { Request, Response, NextFunction, Router } from "express";
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
import queryParam from "../validator/query-param";
import { User } from "../entity/User";
const router = Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const userRepository = AppDataSource.getRepository(User);
const tenantService = new TenantService(tenantRepository, userRepository, AppDataSource);
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
router.get("/", authenticate, queryParam, validateRequest, (req: Request, res: Response, next: NextFunction) =>
  tenantController.listTenant(req, res, next)
);

// GET tenant by id
router.get("/:id", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) =>
  tenantController.getTenantById(req, res, next)
);

// GET managers count by tenant id
router.get(
  "/:id/managers-count",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => tenantController.getManagersCount(req, res, next)
);

// PATCH tenant by id
router.patch(
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
