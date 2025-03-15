import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Roles } from "../../constants";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { User } from "../../entity/User";
import { AuthResponse } from "../../types";
import { createTenant } from "../utils";
import { Tenant } from "../../entity/Tenant";

describe("POST /users", () => {
  let connection: DataSource;

  const managerData = {
    firstName: "Shraddha",
    lastName: "Pawar",
    email: "shraddha@gmail.com",
    password: "Shraddha$123",
    address: "Bangalore, India",
    tenantId: null,
    role: Roles.MANAGER,
  };

  let jwksMock: JWKSMock;
  let stopJwks: () => void;
  let tenant: Tenant;

  beforeAll(async () => {
    jwksMock = createJWKSMock("http://localhost:3200");

    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    stopJwks = jwksMock.start();
    tenant = await createTenant(connection.getRepository(Tenant));
  });

  afterEach(() => {
    stopJwks();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all the fields", () => {
    it("it should return 201 status code", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });

      // Assert
      expect(response.status).toBe(201);
    });
    it("it should persist the user in database", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });
      const tenant = await createTenant(connection.getRepository(Tenant));

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, tenantId: tenant.id });

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({});
      // Assert
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(managerData.email);
      expect(users[0].role).toBe(Roles.MANAGER);
      expect(users[0].id).toBe((response.body as AuthResponse).id);
    });
    it("it should return 401 status code if admin is not authenticate", async () => {
      // Act
      const response = await request(app)
        .post("/users")
        .send({ ...managerData, tenantId: tenant.id });

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({});

      expect(response.status).toBe(401);
      expect(users).toHaveLength(0);
    });

    it("it should return 403 status code if non admin user tries to create a user/manager", async () => {
      const managerToken = jwksMock.token({
        sub: "123",
        role: Roles.MANAGER,
      });
      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${managerToken}`)
        .send({ ...managerData, tenantId: tenant.id });

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({});
      expect(response.status).toBe(403);
      expect(users).toHaveLength(0);
    });
  });

  describe("Not given all the fields", () => {
    it("should return 400 statusCode if email is missing", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, email: "", tenantId: tenant.id });

      // Assert
      const users = await connection.getRepository(User).find();
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });

    it("should return 400 statusCode if password is missing", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, password: "", tenantId: tenant.id });

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
    it("should return 400 statusCode if firstName is missing", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, firstName: "", tenantId: tenant.id });

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
    it("should return 400 statusCode if lastName is missing", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, lastName: "", tenantId: tenant.id });

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
    it("should return 400 statusCode if address is missing", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, address: "", tenantId: tenant.id });

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
  });
  describe("Fields not in proper format", () => {
    it("should return 400 statusCode if email is not in proper format", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, email: "shraddha", tenantId: tenant.id });

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
    it("should return 400 if password length is less than 8 characters", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, password: "secret", tenantId: tenant.id });

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
    it("should return 400 if password doesn't contain atleast 1 uppercase character,1 lower case character, 1 special character and 1 number", async () => {
      const adminToken = jwksMock.token({
        sub: "123",
        role: Roles.ADMIN,
      });

      // Act
      const response = await request(app)
        .post("/users")
        .set("Cookie", `accessToken=${adminToken}`)
        .send({ ...managerData, password: "shraddhapawar", tenantId: tenant.id });

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      (response.body as AuthResponse).errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
  });
});
