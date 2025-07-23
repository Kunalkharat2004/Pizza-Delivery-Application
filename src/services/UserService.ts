import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { IUser, UserQueryParams } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { Roles } from "../constants";

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async createUser({ firstName, lastName, email, password, role, tenantId }: IUser): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email },
      select: ["id", "firstName", "lastName", "email", "password", "role"],
    });

    if (user) {
      const error = createHttpError(400, "User with this email already exists");
      throw error;
    }

    try {
      // Hash the password using bcryptjs
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Save the user to the database
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to register user");
      throw error;
    }
  }

  async listUsers(validateQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");
    const searchQuery = `%${validateQuery.q}%`;

    if (validateQuery.q) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILIKE :searchQuery", { searchQuery }).orWhere(
            "user.email ILIKE :searchQuery",
            { searchQuery }
          );
        })
      );
    }

    if (validateQuery.role) {
      queryBuilder.andWhere("user.role = :role", { role: validateQuery.role });
    }
    return await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validateQuery.page - 1) * validateQuery.limit)
      .take(validateQuery.limit)
      .getManyAndCount();
  }

  async checkUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email },
      select: ["id", "firstName", "lastName", "email", "password", "role"],
      relations: {
        tenant: true,
      },
    });

    if (!user) {
      const error = createHttpError(401, "Invalid email or password");
      throw error;
    }

    return user;
  }

  async isPasswordMatched(password: string, user: User) {
    return await bcrypt.compare(password, user.password);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ["id", "firstName", "lastName", "email", "role"],
      relations: {
        tenant: true,
      },
    });

    if (!user) {
      const error = createHttpError(404, "User not found");
      throw error;
    }

    return user;
  }

  async updateUser({ id, firstName, lastName, email, password, role, tenantId }: IUser) {
    // if the role of user is customer then tenantId should set to null
    try {
      if (role === Roles.CUSTOMER || role === Roles.ADMIN) {
        tenantId = undefined;
      }
      return await this.userRepository.update(id as string, {
        firstName,
        lastName,
        email,
        role,
        tenant: tenantId ? { id: tenantId } : null,
      });
    } catch (err) {
      const error = createHttpError(500, "Failed to update user");
      throw error;
    }
  }
}
