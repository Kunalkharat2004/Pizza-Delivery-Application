/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
        password: "secret@123",
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
        password: "secret@123",
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
        password: "secret@123",
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
        password: "secret@123",
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
        password: "secret@123",
        address: "Pune, India",
      };

      // Act
      await request(app).post("/auth/register").send(user);
      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store the hashed password in db", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat@gmail.com",
        password: "secret@123",
        address: "Pune, India",
      };

      // Act
      await request(app).post("/auth/register").send(user);

      // Assert
      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();
      expect(users[0].password).not.toBe(user.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$10\$/);
    });

    it("should return 400 statusCode if email is already registered", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat@gmail.com",
        password: "secret@123",
        address: "Pune, India",
      };

      // Act
      const userRepo = connection.getRepository(User);
      await userRepo.save({ ...user, role: Roles.CUSTOMER });

      const users = await userRepo.find();

      // Assert
      const response = await request(app).post("/auth/register").send(user);
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });
  describe("Not given all the fields", () => {
    it("should return 400 statusCode if email is missing", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "",
        password: "secret@123",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);

      // Assert
      const users = await connection.getRepository(User).find();
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");

      response.body.errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
        expect(users).toHaveLength(0);
      });
    });

    it("should return 400 statusCode if password is missing", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat2004@gmail.com",
        password: "",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);
    });

    it("should return 400 statusCode if firstName is missing", async () => {
      // Arrange
      const user = {
        firstName: "",
        lastName: "Kharat",
        email: "kunalkharat2004@gmail.com",
        password: "secret@123",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);

      const users = await connection.getRepository(User).find();
      // Assert

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);
    });
    it("should return 400 statusCode if lastName is missing", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "",
        email: "kunalkharat2004@gmail.com",
        password: "secret@123",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);
    });
    it("should return 400 statusCode if address is missing", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat2004@gmail.com",
        password: "secret@123",
        address: "",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);

      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);
    });
  });

  describe("Fields not in proper format", () => {
    it("should return 400 statusCode if email is not in proper format", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat",
        password: "secret@123",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);
      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("errors");
      expect(users).toHaveLength(0);

      response.body.errors.forEach((error: { msg: string }) => {
        expect(error).toHaveProperty("msg");
        expect(error.msg).toBeDefined();
      });
    });
    it("should return 400 if password lenght is less than 8 characters", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat",
        password: "secret",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);
      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });
    it("should return 400 if password doesn't contain atleast 1 uppercase character,1 lower case character, 1 special character and 1 number", async () => {
      // Arrange
      const user = {
        firstName: "Kunal",
        lastName: "Kharat",
        email: "kunalkharat",
        password: "secret",
        address: "Pune, India",
      };

      // Act
      const response = await request(app).post("/auth/register").send(user);
      const users = await connection.getRepository(User).find();
      // Assert
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(0);
    });
  });
});
