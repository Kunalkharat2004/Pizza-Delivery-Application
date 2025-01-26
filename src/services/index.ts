import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUser } from "../types";
import createHttpError from "http-errors";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async createUser({ firstName, lastName, email, password, address }: IUser): Promise<User> {
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
        address,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(500, "Failed to register user");
      throw error;
    }
  }
}
