import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Tenant } from "../../entity/Tenant";

describe("POST /tenant", () => {
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

  describe("Given all fileds", () => {
    it("should return 201 status code", async () => {
      // Arrange
      const tenantData = {
        name: "Rajesh Sweet Shop",
        address: "Pune, India",
      };
      // Act
      const response = await request(app).post("/tenant").send(tenantData);

      // Assert
      expect(response.status).toBe(201);
    });

    it("should persists the tenant in the database", async () => {
      // Arrange
      const tenantData = {
        name: "Rajesh Sweet Shop",
        address: "Pune, India",
      };

      // Act
      await request(app).post("/tenant").send(tenantData);

      // Assert
      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find({});

      expect(tenant).toHaveLength(1);
      expect(tenant[0].name).toBe(tenantData.name);
      expect(tenant[0].address).toBe(tenantData.address);
    });
  });

  describe("Not given all fields", () => {});
});
