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
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      // Act
      const response = await request(app).get("/tenant").set("Cookie", `accessToken=${adminToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.perPage).toBe(5);
      stopJwks();
    });
    
    it("should return 400 status code if invalid page number is provided", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      // Act
      const response = await request(app).get("/tenant?currentPage=0&perPage=5").set("Cookie", `accessToken=${adminToken}`);
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(1);
      stopJwks();
    });
    it("should return appropriate response when search query is provided", async () => {
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
      const response2 = await request(app).get(`/tenant?q=Rajesh Sweet Shop&currentPage=1&perPage=5`).set("Cookie", `accessToken=${adminToken}`);
      // Assert
      expect(response2.status).toBe(200);
      expect(response2.body.data[0].id).toBe(tenantId);
      expect(response2.body.data[0].name).toBe("Rajesh Sweet Shop");
      expect(response2.body.data[0].address).toBe("Pune, India");
      stopJwks();
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
      const response1 = await request(app).get(`/tenant/${tenantId}`).set("Cookie", `accessToken=${adminToken}`);
      // Assert
      expect(response1.statusCode).toBe(200);
      stopJwks();
    });
    it("should return 404 status code if tenant doesn't exists", async () => {
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
      await request(app).delete(`/tenant/${tenantId}`).set("Cookie", `accessToken=${adminToken}`);

      // Act
      const response2 = await request(app).get(`/tenant/${tenantId}`).set("Cookie", `accessToken=${adminToken}`);
      // Assert
      expect(response2.statusCode).toBe(404);
      stopJwks();
    });
  });
});
