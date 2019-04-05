var Validator = require("jsonschema").Validator;
var v = new Validator();

const schema = {
    type: "object",
    properties: {
        transports: {
            type: "object",
            properties: {
                file: {
                    type: "object",
                    properties: {
                        level: { type: ["array","string"] },
                        filepath: { type: "string" }
                    },
                    required: ["level", "filepath"]
                },
                console: {
                    type: "object",
                    properties: {
                        level: { type: ["array","string"] }
                    },
                    required: ["level"]
                },
                bugsnag: {
                    type: "object",
                    properties: {
                        api_key: { type: "string" },
                        level: { type: ["array","string"] }
                    },  
                    required: ["api_key", "level"]
                },
                logstash: {
                    type: "object",
                    properties: {
                        port: { type: "integer", minimum: 1 },
                        host: { type: "string" },
                        type: { type: "string", enum: ["udp", "tcp"] },
                        level: { type: ["array","string"] }
                    },
                    required: ["port", "host", "level", "type"]
                }
            }
        },
        version: { type: "string" },
        app_name: { type: "string" },
        env: { type: "string" }
    },
    required: ["transports", "version", "app_name", "env"]
};

module.exports = {
    getValidationInfo(config) {
        return v.validate(config, schema);
    }
};