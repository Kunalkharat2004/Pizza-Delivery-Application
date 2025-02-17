import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { Roles } from "../../constants";
import { createJWKSMock, JWKSMock } from "mock-jwks";

describe("GET /auth/self", () => {
  let connection: DataSource;
  const user = {
    firstName: "Kunal",
    lastName: "Kharat",
    email: "kunalkharat@gmail.com",
    password: "secret@123",
    address: "Pune, India",
  };

  let jwksMock: JWKSMock;
  let stopJwks: () => void;

  beforeAll(async () => {
    jwksMock = createJWKSMock("http://localhost:3200");

    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    stopJwks = jwksMock.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    stopJwks();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all the fields", () => {
    it("it should return 200 status code", async () => {
      const userRepository = AppDataSource.getRepository(User);
      const data = await userRepository.save({ ...user, role: Roles.CUSTOMER });

      const accessToken = jwksMock.token({
        sub: data.id,
        role: data.role,
      });
      // Act
      const response = await request(app).get("/auth/self").set("Cookie", `accessToken=${accessToken}`).send();

      // Assert
      expect(response.status).toBe(200);
    });

    it("it should return the id of the user from the database", async () => {
      // Register User
      const userRepository = AppDataSource.getRepository(User);
      const data = await userRepository.save({ ...user, role: Roles.CUSTOMER });

      // Generate Access Token
      const accessToken = jwksMock.token({
        sub: data.id,
        role: data.role,
      });
      // Act
      // Add Access Token to the request header as Cookie
      const response = await request(app).get("/auth/self").set("Cookie", `accessToken=${accessToken}`).send();
      // Assert
      expect((response.body as Record<string, string>).id).toBe(data.id);
    });
  });
});
