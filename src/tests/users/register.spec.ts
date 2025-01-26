import { DataSource } from "typeorm";
import app from "../../app";
import request from "supertest";
import { AppDataSource } from "../../config/data-source";
import { User } from "../../entity/User";
import { RegisterResponse } from "../../types";
import { Roles } from "../../constants";

describe("POST /users/register", () => {
  let connection: DataSource;

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

  describe("Given all the fileds", () => {
    it("should return 201", async () => {
      const user = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "password",
        address: "Sans Francisco",
      };
      const response = await request(app).post("/auth/register").send(user);
      expect(response.status).toBe(201);
    });

    it("should return a json response", async () => {
      const user = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "password",
        address: "Sans Francisco",
      };
      const response = await request(app).post("/auth/register").send(user);
      expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
    });

    it("should persist the user in the database", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat@gmail.com",
        password: "Kunal@123",
        address: "Pune, India",
      };

      // Act
      await request(app).post("/auth/register").send(user);

      // Assert
      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(user.firstName);
      expect(users[0].lastName).toBe(user.lastName);
      expect(users[0].email).toBe(user.email);
      expect(users[0].address).toBe(user.address);
    });

    it("should return the id of the user", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat@gmail.com",
        password: "Kunal@123",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);
      const responseBody = response.body as RegisterResponse;
      expect(responseBody.id).toBeDefined();
      expect(responseBody.message).toBe("User created successfully");
    });

    it("should check the role of user is customer", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat@gmail.com",
        password: "Kunal@123",
        address: "Pune, India",
      };

      // Act
      await request(app).post("/auth/register").send(user);
      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });
  });
  describe("Not given all the fields", () => {});
});
