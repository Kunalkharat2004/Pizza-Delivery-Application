import { Response, NextFunction } from "express";
import { IUser, RegisterRequest, UserQueryParams } from "../types";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import createHttpError from "http-errors";
import { matchedData } from "express-validator";

export class UserController {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly userRepository: Repository<User>
  ) {}
  async create(req: RegisterRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, address, tenantId, role }: IUser = req.body;

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
      const validateQuery = matchedData(req, { onlyValidData: true });
      const [users, count] = await this.userService.listUsers(validateQuery as UserQueryParams);
      res.json({
        data: users,
        total: count,
        currentPage: validateQuery.currentPage as number,
        perPage: validateQuery.perPage as number,
      });
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

      const { firstName, lastName, email, address, role, tenantId } = req.body;

      const user = await this.userService.getUserById(userId);
      if (!user) {
        const error = createHttpError(404, "User not found");
        next(error);
        return;
      }
      const updatedUserData = await this.userService.updateUser({
        id: userId,
        firstName,
        lastName,
        email,
        address,
        password: user.password,
        role,
        tenantId,
      });
      response.json(updatedUserData);
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
