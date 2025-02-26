import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUser } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async createUser({ firstName, lastName, email, password, address, role }: IUser): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (user) {
      const error = createHttpError(400, "User with this email already exists");
      throw error;
    }

    try {
      // Hash the password using bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Save the user to the database
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        address,
        role,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, "Failed to register user");
      throw error;
    }
  }

  async listUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async checkUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: email } });

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
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      const error = createHttpError(404, "User not found");
      throw error;
    }

    return user;
  }
}
