import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { IUser } from "../../types";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { Roles } from "../../constants";
import { createTenant } from "../utils";
import { Tenant } from "../../entity/Tenant";

describe("GET /users", () => {
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

  const customerData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@gmail.com",
    password: "John$123",
    role: Roles.CUSTOMER,
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

  describe("List of users", () => {
    it("should return 401 status code if no token is provided", async () => {
      const response = await request(app).get("/users");
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code if role is not admin", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.CUSTOMER,
      });
      const response = await request(app).get("/users").set("Cookie", `accessToken=${adminToken}`);
      console.log("AccessToken is : ", adminToken);
      expect(response.statusCode).toBe(403);
      stopJwks();
    });

    it("should return 200 status code and empty list when no users exist", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });

      const response = await request(app).get("/users").set("Cookie", `accessToken=${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
      stopJwks();
    });

    it("should return paginated users with correct total count", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });

      // Create multiple users
      await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });

      await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...customerData });

      const response = await request(app)
        .get("/users?page=1&limit=2")
        .set("Cookie", `accessToken=${adminToken}`);

      console.log('response.body:', response.body);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.total).toBeGreaterThanOrEqual(2);
      stopJwks();
    });

    it("should filter users by role", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });

      // Create users with different roles
      await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });

      await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...customerData});

      const response = await request(app)
        .get("/users?role=manager")
        .set("Cookie", `accessToken=${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.every((user: IUser) => user.role === Roles.MANAGER)).toBe(true);
      stopJwks();
    });

    it("should search users by name or email", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });

      // Create users
      await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });

      await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...customerData});

      const response = await request(app)
        .get("/users?q=shraddha")
        .set("Cookie", `accessToken=${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.some((user: IUser) => 
        user.firstName.toLowerCase().includes("shraddha") || 
        user.email.toLowerCase().includes("shraddha")
      )).toBe(true);
      stopJwks();
    });
  });

  describe("Get Single User by ID Endpoint", () => {
    it("should return 200 status code and user data for valid ID", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });

      // Create a user first
      const createResponse = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });

      const userId = createResponse.body.id;

      // Get the user
      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Cookie", `accessToken=${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id", userId);
      expect(response.body).toHaveProperty("firstName", managerData.firstName);
      expect(response.body).toHaveProperty("email", managerData.email);
      stopJwks();
    });

    it("should return 404 status code for non-existent user ID", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });

      const nonExistentId = "123e4567-e89b-12d3-a456-426614174000";
      const response = await request(app)
        .get(`/users/${nonExistentId}`)
        .set("Cookie", `accessToken=${adminToken}`);

      expect(response.statusCode).toBe(404);
      stopJwks();
    });

    it("should return 401 status code if no token is provided", async () => {
      const response = await request(app).get("/users/123");
      expect(response.statusCode).toBe(401);
    });

    it("should return 403 status code if role is not admin", async () => {
      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.CUSTOMER,
      });

      const response = await request(app)
        .get("/users/123")
        .set("Cookie", `accessToken=${adminToken}`);

      expect(response.statusCode).toBe(403);
      stopJwks();
    });
  });
});
