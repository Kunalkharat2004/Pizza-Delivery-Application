import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { IUser } from "../../types";
import { createJWKSMock, JWKSMock } from "mock-jwks";
import { Roles } from "../../constants";

describe("DELETE /users/:id", () => {
  let connection: DataSource;
  let jwksMock: JWKSMock;
  let adminToken: string;
  let managerToken: string;
  let stopJwks: () => void;
  const managerData = {
    firstName: "Shraddha",
    lastName: "Pawar",
    email: "shraddha@gmail.com",
    password: "Shraddha$123",
    address: "Bangalore, India",
  };

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

  describe("DELETE User by ID Endpoint", () => {
    it("should return 401 if user is not authenticated", async () => {
      // Arrange

      jwksMock = createJWKSMock("http://localhost:3200");
      stopJwks = jwksMock.start();
      adminToken = jwksMock.token({
        sub: "1234567890",
        role: Roles.ADMIN,
      });
      const response = await request(app).post("/users").set("Cookie", `accessToken=${adminToken}`).send(managerData);
      const userId = (response.body as IUser).id;

      // Act
      const response1 = await request(app).delete(`/users/${userId}`).send();
      // Assert
      expect(response1.statusCode).toBe(401);
      stopJwks();
    });
    it("should return 403 if user is not admin", async () => {
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
      const response = await request(app).post("/users").set("Cookie", `accessToken=${adminToken}`).send(managerData);
      const userId = (response.body as IUser).id;
      // Act
      const response1 = await request(app)
        .delete(`/users/${userId}`)
        .set("Cookie", `accessToken=${managerToken}`)
        .send();
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

      const response = await request(app).post("/users").set("Cookie", `accessToken=${adminToken}`).send(managerData);
      const userId = (response.body as IUser).id;
      // Act
      const response1 = await request(app).delete(`/users/${userId}`).set("Cookie", `accessToken=${adminToken}`).send();
      // Assert
      expect(response1.statusCode).toBe(200);
      stopJwks();
    });
  });
});
