const assert = require("chai").assert;
// const sinon = require("sinon");
const validator = require("../src/validator");

describe("validator", () => {
    describe("#getValidationInfo", () => {
        it("should return true if transports is empty", () => {
            const config = {
                transports: {},
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isTrue(validator.getValidationInfo(config).valid);
        });
        it("should return true if always is correct", () => {
            let config = {
                transports: {
                    console: {
                        level: "debug"
                    },
                    file: {
                        level: "error",
                        filepath: "./data/test.log"
                    },
                    error: {
                        level: ["error","debug"],
                        api_key: "test-api-key"
                    },
                    logstash: {
                        level: ["info","debug"],
                        port: 123,
                        host: "localhost",
                        type: "udp"
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isTrue(validator.getValidationInfo(config).valid);
        });
        it("should return true if transports.console is correct", () => {
            let config = {
                transports: {
                    console: {
                        level: "debug"
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isTrue(validator.getValidationInfo(config).valid);
        });
        it("should return true if transports.logstash is correct", () => {
            let config = {
                transports: {
                    logstash: {
                        port: 123,
                        host: "localhost",
                        level: "debug",
                        type: "udp"
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isTrue(validator.getValidationInfo(config).valid);
        });
        it("should return true if transports.file is correct", () => {
            let config = {
                transports: {
                    file: {
                        level: "error",
                        filepath: "./data/test.log"
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isTrue(validator.getValidationInfo(config).valid);
        });
        it("should return true if transports.error is correct", () => {
            let config = {
                transports: {
                    error: {
                        api_key: "test-api-key",
                        level: "debug"
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isTrue(validator.getValidationInfo(config).valid);
        });
        it("should return false if version is incorrect", () => {
            let config = {
                transports: {},
                version: 1,
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.version = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.version = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if env is incorrect", () => {
            let config = {
                transports: {},
                version: 1,
                app_name: "test",
                env: 1
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.version = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.version = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if app_name is incorrect", () => {
            let config = {
                transports: {},
                version: 1,
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.version = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.version = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.file is incorrect", () => {
            let config = {
                transports: {
                    file: {}
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.file = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.file = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.logstash is incorrect", () => {
            let config = {
                transports: {
                    logstash: {}
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.logstash = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.file = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.console is incorrect", () => {
            let config = {
                transports: {
                    console: {}
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.console = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.console = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.error is incorrect", () => {
            let config = {
                transports: {
                    bugsnag: {}
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.bugsnag = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.bugsnag = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.logstash.port is incorrect", () => {
            let config = {
                transports: {
                    logstash: {
                        port: "1",
                        host: "localhost"
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.logstash.port = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.logstash.port = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.logstash.host is incorrect", () => {
            let config = {
                transports: {
                    logstash: {
                        port: 10,
                        host: 1
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.logstash.port = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.logstash.port = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.file.level is incorrect", () => {
            let config = {
                transports: {
                    file: {
                        level: 1
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.file.level = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.file.level = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.file.filepath is incorrect", () => {
            let config = {
                transports: {
                    file: {
                        level: "debug",
                        filepath: 1
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.file.filepath = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.file.filepath = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.console.level is incorrect", () => {
            let config = {
                transports: {
                    console: {
                        level: 1
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.console.level = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.console.level = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
        it("should return false if transport.bugsnag.api_key is incorrect", () => {
            let config = {
                transports: {
                    bugsnag: {
                        api_key: 1,
                        level: "info"
                    }
                },
                version: "1",
                app_name: "test",
                env: "test"
            };

            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.bugsnag.api_key = null;
            assert.isFalse(validator.getValidationInfo(config).valid);
            config.transports.bugsnag.api_key = false;
            assert.isFalse(validator.getValidationInfo(config).valid);
        });
    });
});