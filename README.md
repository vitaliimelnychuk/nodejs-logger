# Nodejs Logger

Logger is designed for sending different types of logs to different outputs.

## Types of outputs(transports) that currently is supported:

- Console
- File
- [Bugsnag](https://www.bugsnag.com/)
- [Logstash](https://www.elastic.co/products/logstash)

### Usage

To start using Logger you need to include ```index.js``` file from project to your code.

```javascript
const Logger = require("./index");
```

Then you have to create new instance of Logger and pass as argument configuration object.

```javascript
const logger = new Logger(config);
```

Configuration object have four required keys:

- ```transports``` - describes an outputs that log messages will be sent to;
- ```version``` - version of an application;
- ```app_name``` - name of an application which will be used al ```label``` property at logstash message;
- ```env``` - application environment;

```javascript

const config = {
    transports: {},
    version: "5",
    app_name: "app_name",
    env: "env"
};
```

```label``` property will be automatically set for every message and is equal to ```app_name``` property from config.

```version``` and ```env``` properties will be attached as well and those are equal to the same named properties from config.

```tag``` property is automatically generated for each message and equals the path to the file which called a certain message. The path will be split by dot symbol instead of a regular slash.

To send log message just simply use *error*, *warn*, *info* or *debug* methods of ```logger``` object:

```javascript

logger.error("some message", { "key": "value" });
logger.error(new Error("User is undefined"), { "user_id": "1" });
logger.warn("some message", { "key": "value" });
logger.info("some message", { "key": "value" });
logger.debug("some message", { "key": "value" });
```

If logstash transport has been used, it is necessary to call ```close``` method of ```logger``` object, otherwise logger could prevent the main app from closing because UDP or TCP socket will still be opened.

```javascript
logger.close();
```

#### Helpers

You will be able to log how many time some operation takes by using method `helpers.runWithTimer` method.

```javascript
const helpers = require("logger").helpers;

const sendRequest = () => Promise.resolve({ "key": "value" })

helpers.runWithTimer(sendRequest())
    .then(({operationTime, data}) => {
        ///you will be able to use your logger object here
        logger.info("Operation finished", {operationTime})
    })
```

#### Transports

Transports it is simply outputs that log message will be sent to. They can be added and configured in ```transport``` object added to configuration:

```javascript
const transports = {
    console: {
        level: ["warn", "info", "debug"],
    },
    file: {
        level: ["warn", "error", "debug"],
        filepath: "./data/logs/test.log"
    },
    bugsnag: {
        level: ["error", "info"],
        api_key: "api_key_example"
    },
    logstash: {
        level: "info",
        port: 28888,
        host: "localhost",
        type: "udp"
    }
};
```

```level``` is required field for all of the supported transports. It allows choosing what types of log messages would be written to current output. The field could be either *string* or *array* type. There are four main supported types of level:

- debug
- info
- warn
- error

```filepath``` is required and used only for *file* transport. Allows setting path of the file that log messages should be written to.
```api_key``` is required and used only for *bugsnag* transport. Designed for setting API key for related bugsnag project.
```port```, ```host``` and ```type``` is required and used only for *logstash* transport. They are needed for configuring a connection to logstash server. ```type``` field could be ether *udp* or *tcp*.
