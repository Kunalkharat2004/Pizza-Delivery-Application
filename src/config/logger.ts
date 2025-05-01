import winston, { format, transports } from "winston";
import config from "./config";

// Custom format for structured logging
const customFormat = format.printf(
  ({ level, message, timestamp, service, responseTime, statusCode, latency, ...metadata }) => {
    const hourOfDay = new Date(timestamp as string).getHours();

    return JSON.stringify({
      timestamp,
      message,
      service,
      log_type: level,
      hour_of_day: hourOfDay,
      responseTime,
      statusCode,
      latency,
      ...metadata,
    });
  }
);

const logger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    customFormat
  ),
  defaultMeta: { service: "auth-service" },
  transports: [
    // Console Logs
    new transports.Console({
      level: "info",
      format: format.combine(format.colorize(), customFormat),
      // silent: config.NODE_ENV === "test",
    }),

    // Error Logs
    new transports.File({
      level: "error",
      dirname: "logs",
      filename: "error.log",
      format: customFormat,
      silent: config.NODE_ENV === "test",
    }),

    // Combined Logs
    new transports.File({
      level: "info",
      dirname: "logs",
      filename: "combined.log",
      format: customFormat,
      silent: config.NODE_ENV === "test",
    }),
  ],
});

export default logger;
