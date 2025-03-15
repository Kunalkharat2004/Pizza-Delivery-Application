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
    address: "Bangalore, India",
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

  describe("List of users", () => {
    it("should return 200 status code", async () => {
      // Act
      const response = await request(app).get("/users");

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe("Get Single User by ID Endpoint", () => {
    it("should return 200 status code", async () => {
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

      const userId = (response.body as IUser).id;
      // Act
      const response1 = await request(app).get(`/users/${userId}`);
      // Assert
      expect(response1.statusCode).toBe(200);
      stopJwks();
    });
    // it("should return 404 status code if tenant doesn't exists", async () => {
    //   jwksMock = createJWKSMock("http://localhost:3200");
    //   stopJwks = jwksMock.start();
    //   adminToken = jwksMock.token({
    //     sub: "1234567890",
    //     role: Roles.ADMIN,
    //   });
    //   // Arrange
    //   const tenantData = {
    //     name: "Rajesh Sweet Shop",
    //     address: "Pune, India",
    //   };
    //   const response = await request(app).post("/tenant").set("Cookie", `accessToken=${adminToken}`).send(tenantData);
    //   const tenantId = (response.body as ITenant).id;
    //   await request(app).delete(`/tenant/${tenantId}`).set("Cookie", `accessToken=${adminToken}`);

    //   // Act
    //   const response2 = await request(app).get(`/tenant/${tenantId}`);
    //   // Assert
    //   expect(response2.statusCode).toBe(404);
    //   stopJwks();
    // });
  });
});
