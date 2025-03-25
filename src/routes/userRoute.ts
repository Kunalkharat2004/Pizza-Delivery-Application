import { Request, Response, NextFunction, Router } from "express";
import { AppDataSource } from "../config/data-source";
import authenticate from "../middlewares/authenticate";
import { Roles } from "../constants";
import canAccess from "../middlewares/canAccess";
import validateRequest from "../middlewares/validate-request";
import { UserController } from "../controllers/Usercontroller";
import validateUserCredentials from "../validator/register-validation";
import logger from "../config/logger";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";
import queryParam from "../validator/query-param";

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(logger, userService, userRepository);

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  validateUserCredentials,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => userController.create(req, res, next)
);

// List of all users
router.get(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  queryParam,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => userController.listUsers(req, res, next)
);

// GET user by id
router.get("/:id", (req: Request, res: Response, next: NextFunction) => userController.getUserById(req, res, next));

// PUT user by id
router.put(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  validateUserCredentials,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => userController.updateUser(req, res, next)
);

// DELETE user by id
router.delete("/:id", authenticate, canAccess([Roles.ADMIN]), (req: Request, res: Response, next: NextFunction) =>
  userController.deleteUser(req, res, next)
);

export default router;
