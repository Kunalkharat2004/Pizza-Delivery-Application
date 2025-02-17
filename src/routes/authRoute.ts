import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "../controllers/Authcontroller";
import { UserService } from "../services/User";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import validateUserCredentials from "../validator/register-validation";
import validateRequest from "../middlewares/validate-request";
import TokenService from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import validateLoginCredentials from "../validator/login-validation";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService();
const authController = new AuthController(userService, logger, tokenService, refreshTokenRepository);

router.post("/register", validateUserCredentials, validateRequest, (req: Request, res: Response, next: NextFunction) =>
  authController.register(req, res, next)
);

router.post("/login", validateLoginCredentials, validateRequest, (req: Request, res: Response, next: NextFunction) =>
  authController.login(req, res, next)
);

router.get("/self", authenticate, (req: Request, res: Response) => authController.self(req as AuthRequest, res));

export default router;
