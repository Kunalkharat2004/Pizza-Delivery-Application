import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Tenant } from "../../entity/Tenant";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { Roles } from "../../constants";

describe("POST /tenant", () => {
  const tenantData = {
    name: "Rajesh Sweet Shop",
    address: "Pune, India",
  };
  let connection: DataSource;
  let jwksMock: JWKSMock;
  let adminToken: string;
  let stopJwks: () => void;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwksMock = createJWKSMock("http://localhost:3200");
  });

  beforeEach(async () => {
    stopJwks = jwksMock.start();

    adminToken = jwksMock.token({
      sub: "1234567890",
      role: Roles.ADMIN,
    });
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    stopJwks();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fileds", () => {
    it("should return 201 status code", async () => {
      // Arrange

      // Act
      const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);

      // Assert
      expect(response.status).toBe(201);
    });

    it("should persists the tenant in the database", async () => {
      // Act
      await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);

      // Assert
      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find({});

      expect(tenant).toHaveLength(1);
      expect(tenant[0].name).toBe(tenantData.name);
      expect(tenant[0].address).toBe(tenantData.address);
    });

    it("should return 401 if the user is not authenticated", async () => {
      // Act
      const response = await request(app).post("/tenant").send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find({});

      // Assert
      expect(response.status).toBe(401);
      expect(tenant).toHaveLength(0);
    });
  });

  describe("Not given all fields", () => {});
});
