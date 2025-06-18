import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { AuthHeaders } from "../../types";
import { isJWT } from "../utils";

describe("POST /auth/login", () => {
  let connection: DataSource;
  const user = {
    firstName: "Kunal",
    lastName: "Kharat",
    email: "kunalkharat@gmail.com",
    password: "Secret@123"
  };

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    await request(app).post("/auth/register").send(user);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Valid credentials", () => {
    it("should return 200 status code", async () => {
      // Act
      const response = await request(app).post("/auth/login").send({ email: user.email, password: user.password });

      // Assert
      expect(response.status).toBe(200);
    });

    it("should return a json response and should have message attribute in it", async () => {
      // Act
      const response = await request(app).post("/auth/login").send({ email: user.email, password: user.password });

      // Assert
      expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("message");
    });

    it("should set the accessToken and refreshToken in cookies", async () => {
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      // Act
      const response = await request(app).post("/auth/login").send({ email: user.email, password: user.password });

      // Assert
      const cookies = (response.headers as AuthHeaders)["set-cookie"] || [];
      cookies.forEach((cookie: string) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=").at(-1) ?? null;
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=").at(-1) ?? null;
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJWT(accessToken)).toBeTruthy();
      expect(isJWT(refreshToken)).toBeTruthy();
    });
  });

  describe("Invalid credentials", () => {
    it("should return 401 status code if the email doesn't exists", async () => {
      // Arrange
      const data = {
        email: "nonexistent@gmail.com",
        password: user.password,
      };

      // Act
      const response = await request(app).post("/auth/login").send(data);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("errors");
    });

    it("should return 401 status code if the password is incorrect", async () => {
      // Arrange
      const data = {
        email: user.email,
        password: "incorrectpassword",
      };

      // Act
      const response = await request(app).post("/auth/login").send(data);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("Missing credentials", () => {
    it("should return 400 status code if the email is missing", async () => {
      // Arrange
      const data = {
        email: "",
        password: "secret@123",
      };

      // Act
      const response = await request(app).post("/auth/login").send(data);
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 status code if the password is missing", async () => {
      // Arrange
      const data = {
        email: "kunalkharat@gmail.com",
        password: "",
      };

      // Act
      const response = await request(app).post("/auth/login").send(data);
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("Fields not in proper format", () => {
    it("should return 400 if the email is not in proper format", async () => {
      // Arrange
      const data = {
        email: "kunalkharatmail.com",
        password: "secret@123",
      };
      // Act
      const response = await request(app).post("/auth/login").send(data);

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });
});
