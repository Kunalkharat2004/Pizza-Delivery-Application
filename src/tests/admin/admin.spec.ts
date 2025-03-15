import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { Roles } from "../../constants";
import { createAdminUser } from "../../utils";
import config from "../../config/config";

describe("Admin Creation", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("createAdminUser", () => {
   it("should create an admin user if one does not exist", async () => {
      await createAdminUser();

        const userRepo = connection.getRepository(User);
        const admin = await userRepo.find({ where: { role: Roles.ADMIN } });
        expect(admin).toHaveLength(1);
        expect(admin[0].email).toBe(config.ADMIN_EMAIL);
   });
    it("should skip creation if an admin user already exists", async () => {
        const userRepo = connection.getRepository(User);
        const adminUser = userRepo.create({
            firstName: "Admin",
            lastName: "User",
            email: "admin@gmail.com",
            password: "SecureAdminPassword123!",
            address: "Default Admin Address",
            role: Roles.ADMIN,
    });
    await userRepo.save(adminUser);
    const admin = await userRepo.find({ where: { role: Roles.ADMIN } });
    expect(admin).toHaveLength(1);
});
  });
});
