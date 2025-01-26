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
  synchronize: false,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
