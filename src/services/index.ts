import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUser } from "../types";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async createUser({ firstName, lastName, email, password, address }: IUser): Promise<User> {
    return await this.userRepository.save({
      firstName,
      lastName,
      email,
      password,
      address,
    });
  }
}
