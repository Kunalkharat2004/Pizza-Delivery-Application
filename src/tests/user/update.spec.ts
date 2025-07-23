import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { ITenant, IUser } from "../../types";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { Roles } from "../../constants";
import { createTenant } from "../utils";
import { Tenant } from "../../entity/Tenant";

describe("patch /users/:id", () => {
  let connection: DataSource;
  let jwksMock: JWKSMock;
  let adminToken: string;
  let stopJwks: () => void;
  let tenant: Tenant;

  const managerData = {
    firstName: "Shraddha",
    lastName: "Pawar",
    email: "shraddha@gmail.com",
    password: "Shraddha$123",
    role: Roles.MANAGER,
    tenantId: null,
  };

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    tenant = await createTenant(connection.getRepository(Tenant));
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Update User by ID Endpoint", () => {
    it("should return 401 if user is not authenticated", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });
      const userId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app)
        .patch(`/users/${userId}`)
        .send({ ...managerData, firstName: "Rajesh"});
      // Assert
      expect(response1.statusCode).toBe(401);
      stopJwks();
    });
    it("should return 403 if user is not admin", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.MANAGER,
      });
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });
      const userId = (response.body as IUser).id;
      // Act
      const response1 = await request(app)
        .patch(`/users/${userId}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData });
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
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });
      const userId = (response.body as ITenant).id;
      // Act
      const response1 = await request(app)
        .patch(`/users/${userId}`)
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, firstName: "Rajesh", tenantId: tenant.id });
      // Assert
      expect(response1.statusCode).toBe(200);
      stopJwks();
    });
  });
});
