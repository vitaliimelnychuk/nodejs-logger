const Logger = require("./index");

const logger = new Logger({
    transports: {
        console: {
            level: ["trace", "warn", "info", "debug", "error"],
        },
        file: {
            level: ["trace", "warn", "info", "debug", "error"],
            filepath: "./data/logs/test.log"
        },
        bugsnag: {
            level: ["error"],
            api_key: ""
        }
        ,
        logstash: {
            level: ["trace", "warn", "info", "debug", "error"],
            host: "",
            port: 28888,
            type: "udp"
        }
    },
    version: "5",
    app_name: "app-logger",
    env: "test"
});
var errrr = new Error("User is undefined");
logger.error("test", { "key": "value" });
logger.error(errrr.message, {otherData:"data"});
logger.error(errrr);
logger.warn("some message", { "key": "value" });
logger.info("some message", {
    "body": {
        "provider": "google"
    },
    "headers": {
        "content-type": "application/json",
        "content-length": "5885",
        "connection": "keep-alive"
    }
});
logger.debug("some message", { "key": "value" });
logger.close();
