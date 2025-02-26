import { Response, NextFunction } from "express";
import { RegisterRequest } from "../types";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class UserController {
  constructor(
    private logger: Logger,
    private userService: UserService,
    private userRepository: Repository<User>
  ) {}
  async create(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, address, role, tenantId } = req.body;

      this.logger.debug(`Userdata:}`, {
        firstName,
        lastName,
        email,
        password: "********",
        role,
        address: "********",
      });

      const user = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password,
        address,
        tenantId,
        role,
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

  async listUsers(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.listUsers();
      res.json(users);
    } catch (err) {
      next(err);
      return;
    }
  }

  async getUserById(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      res.json(user);
    } catch (err) {
      next(err);
      return;
    }
  }

  async updateUser(req: RegisterRequest, response: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const { firstName, lastName, email, password, address } = req.body;

      const user = await this.userService.getUserById(userId);
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = password;
      user.address = address;

      await this.userRepository.save(user);
      response.json(user);
    } catch (err) {
      next(err);
      return;
    }
  }

  async deleteUser(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUserById(userId);
      await this.userRepository.delete(user.id);

      res.json({
        message: "User deleted successfully",
        id: user.id,
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}
