import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import config from "./config";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.DB_HOST,
  port: Number(config.DB_PORT),
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,

  // Don't use this in production
  synchronize: config.NODE_ENV === "dev" || config.NODE_ENV === "test",
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
