import { Response, NextFunction } from "express";
import { RegisterRequest } from "../types";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { Roles } from "../constants";

export class UserController {
  constructor(
    private logger: Logger,
    private userService: UserService
  ) {}
  async create(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, address } = req.body;

      this.logger.debug(`Userdata:}`, {
        firstName,
        lastName,
        email,
        password: "********",
        address: "********",
      });

      const user = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password,
        address,
        role: Roles.MANAGER,
      });
      this.logger.info(`User created successfully with id: ${user.id}`);

      res.status(201).json({
        message: "User created successfully",
        id: user.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}
