import { Request, Response, Router } from "express";
import { AuthController } from "../controllers/Authcontroller";
import { UserService } from "../services";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

router.post("/register", (req: Request, res: Response) => authController.register(req, res));

export default router;
