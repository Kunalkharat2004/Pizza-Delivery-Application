import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "../controllers/Authcontroller";
import { UserService } from "../services";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

router.post("/register", (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next));

export default router;
