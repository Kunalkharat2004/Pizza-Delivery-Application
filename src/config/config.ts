import { config as con } from "dotenv";
con();

const _config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
};

const config = Object.freeze(_config);

export default config;
