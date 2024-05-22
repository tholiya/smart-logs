# Smart Logger

**smart-logs** is used to create multiple files based on label, base of this package is [winston](https://www.npmjs.com/package/winston)


# Install

    npm i smart-logs

## Use
```js
import winston from "winston"; //this is required for transporter
import Logger from "smart-logs";

// for commonjs module
//const winston = require("winston");//this is required for transporter
//const Logger = require("smart-logs");

const logger = new Logger();

//set log directory default will be logs
logger.setLogDir('logs'); 

//set log file size, default will unlimited
logger.setSize('5m'); 

//set log formate type
logger.setFormatType('tab');

//add console transporter, it will console each log
logger.transporter([new winston.transports.Console({})])
//add file transporter, it will combined all logs in merge.log file
logger.transporter([new winston.transports.File({filename:'merge.log'})])

const userModuleLog = logger.getLogger('user_module');
const paymentModuleLog = logger.getLogger('payment_module');

//creates user_module_YYYY_MM_DD.log file and add this log
userModuleLog.info('User has been created successfully.', "System User", { id:"abc125", role: "admin" }, { sTag: ["user"] }); 
//creates payment_module_YYYY_MM_DD.log file and add this log
paymentModuleLog.error('payment of user failed.',{ sTag: ["payment","failed"] }); 
```
