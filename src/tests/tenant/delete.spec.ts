import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { ITenant } from "../../types";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { Roles } from "../../constants";
import { User } from "../../entity/User";
import { Tenant } from "../../entity/Tenant";

describe("DELETE /tenant/:id", () => {
  let connection: DataSource;
  let jwksMock: JWKSMock;
  let adminToken: string;
  let managerToken: string;
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

  describe("DELETE Tenant by ID Endpoint", () => {
    it("should return 401 if user is not authenticated", async () => {
      // Arrange
      const tenantData = {
        name: "Rajesh Sweet Shop",
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
      const response1 = await request(app).delete(`/tenant/${tenantId}`).send();
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
      managerToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.MANAGER,
      });
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);
      const tenantId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app)
        .delete(`/tenant/${tenantId}`)
        .set("Cookie", `accessToken=${managerToken}`)
        .send();
      // Assert
      expect(response1.statusCode).toBe(403);
      stopJwks();
    });
    it("should return 200 status code when deleting tenant without managers", async () => {
      // Arrange
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      const tenantData = {
        name: "Rajesh Sweet Shop",
        address: "Pune, India",
      };
      const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);
      const tenantId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app)
        .delete(`/tenant/${tenantId}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send();
      // Assert
      expect(response1.statusCode).toBe(200);
      stopJwks();
    });
    it("should delete tenant and its managers when deleteManagers=true", async () => {
      // Arrange
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      
      // Create tenant
      const tenantData = {
        name: "Rajesh Sweet Shop",
        address: "Pune, India",
      };
      const tenantResponse = await request(app)
        .post("/tenant")
        .set("Cookie", `accessToken=${adminToken}`)
        .send(tenantData);
      const tenantId = (tenantResponse.body as ITenant).id;

      // Create managers for the tenant
      const userRepository = connection.getRepository(User);
      const manager1 = userRepository.create({
        firstName: "Manager1",
        lastName: "Test",
        email: "manager1@test.com",
        password: "Password$123",
        role: Roles.MANAGER,
        tenant: { id: tenantId },
        address: "Pune, India",
      });
      const manager2 = userRepository.create({
        firstName: "Manager2",
        lastName: "Test",
        email: "manager2@test.com",
        password: "Password$123",
        role: Roles.MANAGER,
        tenant: { id: tenantId },
        address: "Pune, India",
      });
      await userRepository.save([manager1, manager2]);

      // Act
      const response = await request(app)
        .delete(`/tenant/${tenantId}?deleteManagers=true`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
      
      // Verify tenant is deleted
      const tenantRepository = connection.getRepository(Tenant);
      const deletedTenant = await tenantRepository.findOneBy({ id: tenantId });
      expect(deletedTenant).toBeNull();

      // Verify managers are deleted
      const managers = await userRepository.find({
        where: {
          tenant: { id: tenantId },
          role: Roles.MANAGER
        }
      });
      expect(managers).toHaveLength(0);
      
      stopJwks();
    });
  
    it("should return 404 when trying to delete non-existent tenant", async () => {
      // Arrange
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      
      const nonExistentTenantId = "9e462c83-5abe-4ccf-a3f2-14d0539ce820";

      // Act
      const response = await request(app)
        .delete(`/tenant/${nonExistentTenantId}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send();
      // Assert
      expect(response.statusCode).toBe(404);
      
      stopJwks();
    });
  });
});
