import winston, { format, transports } from "winston";
import config from "./config";

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "auth-service" },
  transports: [
    // Console Logs
    new transports.Console({
      level: "info",
      format: format.simple(),
      // silent: config.NODE_ENV === "test",
    }),

    // Error Logs
    new transports.File({
      level: "error",
      dirname: "logs",
      filename: "error.log",
      format: format.combine(format.uncolorize(), format.simple()),
      silent: config.NODE_ENV === "test",
    }),

    // Combined Logs
    new transports.File({
      level: "info",
      dirname: "logs",
      filename: "combined.log",
      format: format.combine(format.uncolorize(), format.simple()),
      silent: config.NODE_ENV === "test",
    }),
  ],
});

export default logger;
