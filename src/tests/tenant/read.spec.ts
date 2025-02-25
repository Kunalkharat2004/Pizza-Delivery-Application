import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { ITenant } from "../../types";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { Roles } from "../../constants";

describe("GET /tenant/:id", () => {
  let connection: DataSource;
  let jwksMock: JWKSMock;
  let adminToken: string;
  let stopJwks: () => void;

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

  describe("List of tenants", () => {
    it("should return 200 status code", async () => {
      // Act
      const response = await request(app).get("/tenant");

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe("Get Single Tenant by ID Endpoint", () => {
    it("should return 200 status code", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      // Arrange
      const tenantData = {
        name: "Rajesh Sweet Shop",
        address: "Pune, India",
      };
      const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);

      const tenantId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app).get(`/tenant/${tenantId}`);
      // Assert
      expect(response1.statusCode).toBe(200);
      stopJwks();
    });
  });
});
