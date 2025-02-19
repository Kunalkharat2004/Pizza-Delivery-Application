import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { AuthHeaders } from "../../types";
import { RefreshToken } from "../../entity/RefreshToken";
import jwt from "jsonwebtoken";
import { isJWT } from "class-validator";

describe("GET /auth/refresh", () => {
  let connection: DataSource;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  const user = {
    firstName: "Kunal",
    lastName: "Kharat",
    email: "kunalkharat@gmail.com",
    password: "secret@123",
    address: "Pune, India",
  };

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    // Register user and extract the refreshToken cookie from the response
    const response = await request(app).post("/auth/register").send(user);
    const cookies = (response.headers as AuthHeaders)["set-cookie"] || [];
    cookies.forEach((cookie) => {
      if (cookie.startsWith("refreshToken=")) {
        refreshToken = cookie.split(";")[0].split("=").at(-1) ?? null;
      }
    });
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Refresh token provided", () => {
    it("should return 200 status code", async () => {
      // Act
      const response = await request(app).get("/auth/refresh").set("Cookie", `refreshToken=${refreshToken}`).send();

      // Assert
      expect(response.status).toBe(200);
    });

    it("should return a json response", async () => {
      // Act
      const response = await request(app).get("/auth/refresh").send();

      // Assert
      expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
    });

    it("should return 401 status code if refreshToken is revoked(i.e not found in the database)", async () => {
      const decoded = jwt.decode(refreshToken!) as { jti?: string };
      // Delete the refreshToken from the database
      if (decoded?.jti) {
        const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
        // Delete the refresh token record from the database by its ID (jti)
        await refreshTokenRepo.delete(decoded.jti);
      }
      // Act
      const response = await request(app).get("/auth/refresh").set("Cookie", `refreshToken=${refreshToken}`).send();

      // Assert
      expect(response.status).toBe(401);
    });

    it("should set accessToken and refreshToken in cookie", async () => {
      // Act
      const response = await request(app).get("/auth/refresh").set("Cookie", `refreshToken=${refreshToken}`).send();

      const cookies = (response.headers as AuthHeaders)["set-cookie"] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=").at(-1) ?? null;
        }
        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=").at(-1) ?? null;
        }
      });

      // Assert
      expect(accessToken).not.toBeNull();
      expect(isJWT(accessToken)).toBeTruthy();
      expect(refreshToken).not.toBeNull();
      expect(isJWT(refreshToken)).toBeTruthy();
    });
  });

  describe("Refresh token not provided", () => {
    it("should return 401 if refresh token is not valid", async () => {
      const refreshToken = "invalid-token";

      // Act
      const response = await request(app).get("/auth/refresh").set("Cookie", `refreshToken=${refreshToken}`).send();

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
