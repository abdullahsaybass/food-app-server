import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    process.env.NODE_ENV === "production"
      ? format.json()
      : combine(colorize(), logFormat)
  ),
  transports: [new transports.Console()],
});

export default logger;