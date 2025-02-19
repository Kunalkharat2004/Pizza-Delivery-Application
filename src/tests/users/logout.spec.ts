// import request from "supertest";
// import app from "../../app";
// import { DataSource } from "typeorm";
// import { AppDataSource } from "../../config/data-source";
// import { AuthHeaders } from "../../types";
// import jwt from "jsonwebtoken";
// import { RefreshToken } from "../../entity/RefreshToken";
// import { createJWKSMock, JWKSMock } from "mock-jwks";

// describe("POST /auth/logout", () => {
//   let connection: DataSource;
//   let accessToken: string | null = null;
//   let refreshToken: string | null = null;

//   const user = {
//     firstName: "Kunal",
//     lastName: "Kharat",
//     email: "kunalkharat@gmail.com",
//     password: "secret@123",
//     address: "Pune, India",
//   };

//   let jwksMock: JWKSMock;
//   let stopJwks: () => void;

//   beforeAll(async () => {
//     // Create a mock JWKS server (adjust the URL if needed)
//     jwksMock = createJWKSMock("http://localhost:3200");
//     connection = await AppDataSource.initialize();
//   });

//   beforeEach(async () => {
//     // Start the JWKS mock before each test and capture the stop function
//     stopJwks = jwksMock.start();
//     await connection.dropDatabase();
//     await connection.synchronize();

//     // Register the user and extract tokens from the cookies
//     const response = await request(app).post("/auth/register").send(user);
//     const cookies = (response.headers as AuthHeaders)["set-cookie"] || [];
//     cookies.forEach((cookie) => {
//       if (cookie.startsWith("accessToken=")) {
//         accessToken = cookie.split(";")[0].split("=").pop() ?? null;
//       }
//       if (cookie.startsWith("refreshToken=")) {
//         refreshToken = cookie.split(";")[0].split("=").pop() ?? null;
//       }
//     });
//   });

//   afterEach(() => {
//     // Stop the JWKS mock after each test
//     stopJwks();
//   });

//   afterAll(async () => {
//     await connection.destroy();
//   });

//   describe("User is logged in", () => {
//     it("should return 200 status code", async () => {
//       // Act
//       const response = await request(app)
//         .post("/auth/logout")
//         .set("Cookie", `accessToken=${accessToken}; refreshToken=${refreshToken}`)
//         .send();

//       // Assert
//       expect(response.status).toBe(200);
//     });

//     it("should delete the refresh token from the database", async () => {
//       // Act: Logout to trigger deletion of the refresh token record
//       await request(app)
//         .post("/auth/logout")
//         .set("Cookie", `accessToken=${accessToken}; refreshToken=${refreshToken}`)
//         .send();

//       // Decode the refresh token to obtain the jti (unique token ID)
//       const decoded = jwt.decode(refreshToken!) as { jti?: string };
//       if (!decoded?.jti) {
//         throw new Error("Refresh token does not contain a jti claim");
//       }

//       // Check that the refresh token record is no longer in the database
//       const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
//       const tokenRecord = await refreshTokenRepo.findOne({ where: { id: decoded.jti } });
//       expect(tokenRecord).toBeNull();
//     });
//   });

//   describe("User is not logged in", () => {
//     it("should return 401 if refresh token is invalid", async () => {
//       const invalidToken = "invalid-token";

//       // Act
//       const response = await request(app)
//         .post("/auth/logout")
//         .set("Cookie", `accessToken=${accessToken}; refreshToken=${invalidToken}`)
//         .send();

//       // Assert
//       expect(response.status).toBe(401);
//     });
//   });
// });
