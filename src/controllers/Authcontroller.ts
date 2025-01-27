import { NextFunction, Response } from "express";
import { RegisterRequest } from "../types";
import { UserService } from "../services";
import { Logger } from "winston";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async register(req: RegisterRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password, address } = req.body;

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    this.logger.debug(`Userdata:}`, {
      firstName,
      lastName,
      email,
      password: "********",
      address: "********",
    });

    try {
      const user = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        address,
        role: Roles.CUSTOMER,
      });

      this.logger.info(`User created successfully with id: ${user.id}`);

      res.status(201).json({
        message: "User created successfully",
        id: user.id,
      });
    } catch (error) {
      next(error);
      return;
    }
  }
}
