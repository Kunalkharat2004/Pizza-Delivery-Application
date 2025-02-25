import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { ITenant } from "../../types";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { Roles } from "../../constants";

describe("PUT /tenant/:id", () => {
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

  describe("Update Tenant by ID Endpoint", () => {
    it("should return 401 if user is not authenticated", async () => {
      // Arrange
      const tenantData = {
        name: "Raj Sweet Shop",
        address: "Pune, India",
      };
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);
      const tenantId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app)
        .put(`/tenant/${tenantId}`)
        .send({ name: "Rajesh Sweet Shop", address: "Pune, India" });
      // Assert
      expect(response1.statusCode).toBe(401);
      stopJwks();
    });
    it("should return 403 if user is not admin", async () => {
      // Arrange
      const tenantData = {
        name: "Raj Sweet Shop",
        address: "Pune, India",
      };
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.MANAGER,
      });
      const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);
      const tenantId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app)
        .put(`/tenant/${tenantId}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ name: "Rajesh Sweet Shop", address: "Pune, India" });
      // Assert
      expect(response1.statusCode).toBe(403);
      stopJwks();
    });
    it("should return 200 status code", async () => {
      // Arrange
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      const tenantData = {
        name: "Raj Sweet Shop",
        address: "Pune, India",
      };
      const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);
      const tenantId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app)
        .put(`/tenant/${tenantId}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ name: "Rajesh Sweet Shop", address: "Pune, India" });
      // Assert
      expect(response1.statusCode).toBe(200);
      stopJwks();
    });
  });
});
