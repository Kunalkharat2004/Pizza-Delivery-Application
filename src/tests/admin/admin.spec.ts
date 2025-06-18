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
   it("should hash the admin password securely", async () => {
    await createAdminUser();

    const userRepo = connection.getRepository(User);
    const admin = await userRepo.find({ where: { role: Roles.ADMIN },
    select:["email","password","firstName","lastName"] });
    expect(admin).toHaveLength(1);

    expect(admin[0].password).not.toBe("SecureAdminPassword123!");
    expect(admin[0].password.startsWith("$2")).toBe(true);
    });

    it("should skip creation if an admin user already exists", async () => {
        const userRepo = connection.getRepository(User);
        const adminUser = userRepo.create({
            firstName: "Admin",
            lastName: "User",
            email: "admin@gmail.com",
            password: "SecureAdminPassword123!",
            role: Roles.ADMIN,
    });
    await userRepo.save(adminUser);
    const admin = await userRepo.find({ where: { role: Roles.ADMIN }
    });
    console.log("Admin: ",admin);
    
    expect(admin).toHaveLength(1);
});

it("should log an error if an error occurs", async () => {
    const logger = require("../../config/logger").default;
    const spy = jest.spyOn(logger, "error");
    jest.spyOn(connection, "getRepository").mockImplementation(() => {
        throw new Error("Error creating admin user");
    });
    await createAdminUser();
    expect(spy).toHaveBeenCalled();
}
);
  });
});
