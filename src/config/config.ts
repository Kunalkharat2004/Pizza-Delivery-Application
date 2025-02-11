import { config as con } from "dotenv";
import path from "path";
con({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, REFRESH_TOKEN_SECRET } = process.env;

const _config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
};

const config = Object.freeze(_config);
export default config;
