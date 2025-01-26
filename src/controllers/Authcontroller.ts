import { Response } from "express";
import { RegisterRequest } from "../types";
import { UserService } from "../services";

export class AuthController {
  constructor(private userService: UserService) {}

  async register(req: RegisterRequest, res: Response) {
    const { firstName, lastName, email, password, address } = req.body;

    const user = await this.userService.createUser({ firstName, lastName, email, password, address });

    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  }
}
