export const addNumbersInArray = (arr: number[]): number => arr.reduce((acc, curr) => acc + curr, 0);
import { User } from "./entity/User";
import { Roles } from "./constants";
import bcrypt from "bcryptjs";
import logger from "./config/logger";
import { AppDataSource } from "./config/data-source";
import config from "./config/config";

export async function createAdminUser() {
  try {
    const userRepo = AppDataSource.getRepository(User);

    // Check if an admin user already exists
    const existingAdmin = await userRepo.findOne({ where: { role: Roles.ADMIN } });
    if (existingAdmin) {
      logger.info("Admin user already exists. Skipping creation.");
      return;
    }
    // Retrieve credentials from environment variables or set defaults
    const adminEmail = config.ADMIN_EMAIL ?? "admin@gmail.com";
    const adminPassword = config.ADMIN_PASSWORD ?? "SecureAdminPassword123!";
    const adminFirstName = config.ADMIN_FIRSTNAME ?? "Admin";
    const adminLastName = config.ADMIN_LASTNAME ?? "User";
    const adminAddress = config.ADMIN_ADDRESS ?? "Default Admin Address";

    // Hash the admin password securely
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the admin user
    const adminUser = userRepo.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: hashedPassword,
      address: adminAddress,
      role: Roles.ADMIN,
    });

    // Save the admin user to the database
    await userRepo.save(adminUser);
    logger.info("Admin user created automatically.");
  } catch (error) {
    logger.error("Error creating admin user: ", error);
  }
}
