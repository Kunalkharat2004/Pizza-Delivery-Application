import { Request, Response, Router } from "express";
import { AuthController } from "../controllers/Authcontroller";

const router = Router();
const authController = new AuthController();

router.post("/register", (req: Request, res: Response) => authController.register(req, res));

export default router;
