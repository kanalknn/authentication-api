const winston = require("winston");
const fs = require("fs");
const path = require("path");

// Ensure logs directory exists
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define custom log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message} \nStack: ${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Default log level
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // Console Transport for Development
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? winston.format.json() : logFormat,
    }),

    // File Transports
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
  ],
});

// Export logger
module.exports = logger;