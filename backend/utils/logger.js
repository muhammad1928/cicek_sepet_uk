const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Log Formatı: [Zaman] [Seviye]: Mesaj
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info', // info ve üzeri (warn, error) kaydedilir
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 1. Hataları 'error.log' dosyasına yaz
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // 2. Her şeyi 'combined.log' dosyasına yaz
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Eğer Production değilsek, konsola da renkli yaz
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      logFormat
    ),
  }));
}

module.exports = logger;