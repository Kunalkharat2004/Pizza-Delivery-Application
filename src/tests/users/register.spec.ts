import { DataSource } from "typeorm";
import app from "../../app";
import request from "supertest";
import { AppDataSource } from "../../config/data-source";
import { truncateTable } from "../utils";
import { User } from "../../entity/User";

describe("POST /users/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await truncateTable(connection);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all the fileds", () => {
    it("should return 201", async () => {
      const user = {
        firstname: "John",
        lastname: "Doe",
        email: "johndoe@gmail.com",
        password: "password",
        confirmPassword: "password",
      };
      const response = await request(app).post("/auth/register").send(user);
      expect(response.status).toBe(201);
    });

    it("should return a json response", async () => {
      const user = {
        firstname: "John",
        lastname: "Doe",
        email: "johndoe@gmail.com",
        password: "password",
        confirmPassword: "password",
      };
      const response = await request(app).post("/auth/register").send(user);
      expect(response.header["content-type"]).toBe("application/json; charset=utf-8");
    });

    it("should persist the user in the database", async () => {
      const user = {
        firstname: "John",
        lastname: "Doe",
        email: "johndoe@gmail.com",
        password: "password",
        confirmPassword: "password",
      };
      await request(app).post("/auth/register").send(user);

      const userRepo = connection.getRepository(User);
      const users = await userRepo.find();
      expect(users).toHaveLength(1);
    });
  });
  describe("Not given all the fields", () => {});
});
