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

  setFormatType(type) {
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
        if (meta?.stack) {
          message += `${meta?.stack}`;
        }
                
        if (!meta?.stack) {
          tags?.map(obj => {
            if (obj instanceof Error) {
              message += ` ${obj.stack}`
            }
          })
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

        if (meta?.stack) {
          message += ` ${meta?.stack}`;
        }

        return `${timestamp} : ${level} : '${message}' : ${metaData}`;
      });
    }
  }

  formatRFC3339Nano() {
    const date = new Date();
    const pad = (num, size) => String(num).padStart(size, '0');
  
    // Get milliseconds
    const ms = date.getMilliseconds();
  
    // Get high-resolution time using performance.now()
    const hrTime = process.hrtime();
  
    // Calculate the total nanoseconds (milliseconds + microseconds + additional nanoseconds)
    const millisecondsAsNs = ms * 1_000_000; // convert milliseconds to nanoseconds
    const additionalNanoseconds = hrTime[1];
    const totalNanoseconds = millisecondsAsNs + additionalNanoseconds;
    const nanosecondsStr = pad(totalNanoseconds, 9).slice(0, 9);
  
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1, 2);
    const day = pad(date.getUTCDate(), 2);
    const hours = pad(date.getUTCHours(), 2);
    const minutes = pad(date.getUTCMinutes(), 2);
    const seconds = pad(date.getUTCSeconds(), 2);
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${nanosecondsStr}Z`;
  }

  format(fileName) {
    return winston.format.combine(
      winston.format.timestamp({
        format: () =>{
          return this.formatRFC3339Nano()
        }
      }),
      winston.format.errors({stack: true}),
      this.getFormat(fileName)
    );
  }

  fileTransport(label) {
    return new DailyRotateFile({
      filename: `${this.logDir}/${label}_%DATE%.log`,
      datePattern: "YYYY_MM_DD",
      maxSize: this.fileSize,
      utc: true
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
