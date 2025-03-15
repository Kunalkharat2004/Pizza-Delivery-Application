import { config as con } from "dotenv";
import path from "path";
con({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV ?? "dev"}`) });

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
  CLIENT_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_ADDRESS,
  ADMIN_FIRSTNAME,
  ADMIN_LASTNAME,
} = process.env;

const _config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  PRIVATE_KEY,
  CLIENT_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_ADDRESS,
  ADMIN_FIRSTNAME,
  ADMIN_LASTNAME,
};

const config = Object.freeze(_config);
export default config;
