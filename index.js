const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

class Logger {
  constructor() {
    this.logDir = "logs";
    this.fileSize = null;
    this.formatType = null;
    this.transporters = [];
  }

  transporter(transporters) {
    // Concatenate the new transporters with existing ones
    this.transporters = [...this.transporters, ...transporters];
  }

  setLogDir(dir) {
    this.logDir = dir;
  }

  setSize(size) {
    this.fileSize = size;
  }

  setFormateType(type) {
    this.formatType = type;
  }

  getFormat(fileName) {
    if (this.formatType === "tab") {
      return winston.format.printf(({ level, message, timestamp, ...meta }) => {
        if (typeof message == "object") {
          message = JSON.stringify(message);
        };
        let metaData = "";
        let tags = meta[Symbol.for("splat")];
        if (tags && !!tags.length) {
          const option = tags.pop();
          if (option && Object.keys(option).length === 1 && !!option?.sTag) {
            metaData = option?.sTag?.join();
          } else {
            tags.push(option);
          };
          tags.forEach((function (tag) {
            if (typeof tag !== 'string') {
              tag = JSON.stringify(tag);
            };
            message += ` ${tag}`;
          }))
        }
        return `${timestamp}\t${fileName}\t${level}\t${message}\t${metaData}`;
      });
    } else {
      return winston.format.printf(({ level, message, timestamp, ...meta }) => {
        if (typeof message == "object") {
          message = JSON.stringify(message);
        };
        let metaData = "";
        let tags = meta[Symbol.for("splat")];
        if (tags && !!tags.length) {
          const option = tags.pop();
          if (option && Object.keys(option).length === 1 && !!option?.sTag) {
            metaData = option?.sTag?.join();
          } else {
            tags.push(option);
          };
          tags.forEach((function (tag) {
            if (typeof tag !== 'string') {
              tag = JSON.stringify(tag);
            };
            message += ` ${tag}`;
          }))
        }
        return `${timestamp} : ${level} : ${message} : ${metaData}`;
      });
    }
  }

  format(fileName) {
    return winston.format.combine(
      winston.format.timestamp(),
      this.getFormat(fileName)
    );
  }

  fileTransport(label) {
    return new DailyRotateFile({
      filename: `${this.logDir}/${label}_%DATE%.log`,
      datePattern: "YYYY_MM_DD",
      maxSize: this.fileSize,
    });
  }

  getLogger(fileName) {
    let logTransporter = [...this.transporters, this.fileTransport(fileName)];
    return winston.createLogger({
      format: this.format(fileName),
      transports: logTransporter,
    });
  }
}

module.exports = Logger;