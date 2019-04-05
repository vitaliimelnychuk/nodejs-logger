const assert = require("chai").assert;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const Logger = proxyquire("../src/logger.js", {
});

const loggerConfig = {
    transports: {
        console: {
            level: ["trace", "warn", "info", "debug", "error"],
        },
    },
    version: "5",
    app_name: "test_app_name",
    env: "test"
};

describe("logger:config", () => {
    describe("#constructor", () => {
        it("should throw an error if config invalid", () => {
            assert.throws(function() { new Logger(null); });
        });
    });
    describe("#properties", () => {
        it("should return provider passed to setter", () => {
            const logger = new Logger(loggerConfig);
            const provider = {
                test_key: 1
            };
            logger.provider = provider;
            assert.equal(logger.provider, provider);
        });
        it("should return app name as label if set", () => {
            const logger = new Logger(loggerConfig);
            assert.equal(logger.label, "test_app_name");
        });
        it("should return empty label if app name is not set", () => {
            const logger = new Logger(Object.assign({}, loggerConfig));
            delete logger.provider.config.app_name;
            assert.equal(logger.label, "");
        });
    });

    describe("#error", () => {
        it("should call error method of provider", () => {
            const logger = new Logger(loggerConfig);
            const errorStub = sinon.stub();
            logger.provider.logger.error = errorStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.error("test", {message:"some test"});
            const firstArg = errorStub.getCall(0).args[0];
            assert.deepEqual(JSON.stringify(firstArg, Object.getOwnPropertyNames(firstArg)), "{\"err\":\"\\\"test\\\"\",\"data\":{},\"tag\":\"tag\",\"label\":\"test_app_name\"}");
        });

        it("should call error method of provider with message in error", () => {
            const logger = new Logger(loggerConfig);
            const errorStub = sinon.stub();
            logger.provider.logger.error = errorStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.error({message:"some test"});
            const firstArg = errorStub.getCall(0).args[0];
            assert.deepEqual(JSON.stringify(firstArg, Object.getOwnPropertyNames(firstArg)), "{\"err\":\"{\\\"message\\\":\\\"some test\\\"}\",\"data\":{},\"tag\":\"tag\",\"label\":\"test_app_name\"}");
        });

        it("should call error method of provider with no arguments", () => {
            const logger = new Logger(loggerConfig);
            const errorStub = sinon.stub();
            logger.provider.logger.error = errorStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.error();
            const firstArg = errorStub.getCall(0).args[0];
            assert.deepEqual(JSON.stringify(firstArg, Object.getOwnPropertyNames(firstArg)), "{\"err\":\"\\\"\\\"\",\"data\":{},\"tag\":\"tag\",\"label\":\"test_app_name\"}");
        });
    });

    describe("#warn", () => {
        it("should call warn method of provider", () => {
            const logger = new Logger(loggerConfig);
            const warnStub = sinon.stub();
            logger.provider.logger.warn = warnStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.warn("test", { key: "some test" });
            const firstArg = warnStub.getCall(0).args[0];
            const secondArg = warnStub.getCall(0).args[1];
            assert.deepEqual(JSON.stringify(firstArg), JSON.stringify({tag: "tag","label":"test_app_name", data: { key: "some test" }}));
            assert.deepEqual(secondArg, "test");
        });

        it("should call warn method of provider with no arguments", () => {
            const logger = new Logger(loggerConfig);
            const warnStub = sinon.stub();
            logger.provider.logger.warn = warnStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.warn();
            const firstArg = warnStub.getCall(0).args[0];
            const secondArg = warnStub.getCall(0).args[1];
            assert.deepEqual(JSON.stringify(firstArg), JSON.stringify({tag: "tag","label":"test_app_name", data: {  }}));
            assert.deepEqual(secondArg, "");
        });
    });
    describe("#debug", () => {
        it("should call debug method of provider", () => {
            const logger = new Logger(loggerConfig);
            const debugStub = sinon.stub();
            logger.provider.logger.debug = debugStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.debug("test", { key: "some test" });
            const firstArg = debugStub.getCall(0).args[0];
            const secondArg = debugStub.getCall(0).args[1];
            assert.deepEqual(JSON.stringify(firstArg), JSON.stringify({tag: "tag","label":"test_app_name", data: { key: "some test" }}));
            assert.equal(secondArg, "test");
        });

        it("should call debug method of provider with no arguments", () => {
            const logger = new Logger(loggerConfig);
            const debugStub = sinon.stub();
            logger.provider.logger.debug = debugStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.debug();
            const firstArg = debugStub.getCall(0).args[0];
            const secondArg = debugStub.getCall(0).args[1];
            assert.deepEqual(JSON.stringify(firstArg), JSON.stringify({tag: "tag","label":"test_app_name", data: {  }}));
            assert.equal(secondArg, "");
        });
    });
    describe("#info", () => {
        it("should call info method of provider", () => {
            const logger = new Logger(loggerConfig);
            const infoStub = sinon.stub();
            logger.provider.logger.info = infoStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.info("test", { key: "some test" });
            const firstArg = infoStub.getCall(0).args[0];
            const secondArg = infoStub.getCall(0).args[1];
            assert.deepEqual(JSON.stringify(firstArg), JSON.stringify({tag: "tag", "label":"test_app_name",data: { key: "some test" }}));
            assert.deepEqual(secondArg, "test");
        });

        it("should call info method with no arguments", () => {
            const logger = new Logger(loggerConfig);
            const infoStub = sinon.stub();
            logger.provider.logger.info = infoStub;
            logger.getTag = sinon.stub().returns("tag");
            logger.info();
            const firstArg = infoStub.getCall(0).args[0];
            const secondArg = infoStub.getCall(0).args[1];
            assert.deepEqual(JSON.stringify(firstArg), JSON.stringify({tag: "tag", "label":"test_app_name",data: {}}));
            assert.deepEqual(secondArg, "");
        });
    });
    describe("#close", () => {
        it("should call close method logstash stream", () => {
            const logstashLoggerConfig = {
                transports: {
                    logstash: {
                        level: "info",
                        port: 28888,
                        host: "localhost",
                        type: "udp"
                    }
                },
                version: "5",
                app_name: "test",
                env: "test"
            };
            const logger = new Logger(logstashLoggerConfig);
            const closeStub = sinon.stub();
            logger.provider.createLogstashStream = sinon.stub().returns({
                streamToClose: {
                    close: closeStub
                }
            });
            let pinoProvider = logger.provider;
            pinoProvider.logger = pinoProvider.initLogger();
            pinoProvider.streams[0].streamToClose.close = closeStub;
            logger.close();
            assert.isTrue(closeStub.calledOnce);
        });
        it("should not call close method logstash stream", () => {
            const logstashLoggerConfig = {
                transports: {
                    logstash: {
                        level: "info",
                        port: 28888,
                        host: "localhost",
                        type: "udp"
                    }
                },
                version: "5",
                app_name: "test",
                env: "test"
            };
            const logger = new Logger(logstashLoggerConfig);
            const closeStub = sinon.stub();
            logger.provider.createLogstashStream = sinon.stub().returns({
                streamToClose: null
            });
            let pinoProvider = logger.provider;
            pinoProvider.logger = pinoProvider.initLogger();
            logger.close();
            assert.isFalse(closeStub.calledOnce);
        });
    });

    describe("#getPathsOfLoggerAndCallingScript", () => {
        it("should return third and fourth paths of called function stack when paths starts from parentheses", () => {
            const logger = new Logger(loggerConfig);
            logger.getCallStack = sinon.stub().returns("Error: User is undefined\n  at Module.load (module.js:565:32)\n at tryModuleLoad (module.js:505:12)\n at Function.Module._load (module.js:497:3)\n at Function.Module.runMain (module.js:693:10)\n at startup (bootstrap_node.js:188:16)\n ");
            assert.deepEqual(logger.getPathsOfLoggerAndCallingScript(), {
                logger:"module", 
                script:"bootstrap_node"
            });
        }); 

        it("should return third and fourth paths of called function stack when paths starts from slash", () => {
            const logger = new Logger(loggerConfig);
            logger.getCallStack = sinon.stub().returns("Error: User is undefined\n  at Module.load (/home/module.js:565:32)\n at tryModuleLoad (/home/module.js:505:12)\n at Function.Module._load (/home/module.js:497:3)\n at Function.Module.runMain (/home/module.js:693:10)\n at startup (/home/bootstrap_node.js:188:16)\n ");
            assert.deepEqual(logger.getPathsOfLoggerAndCallingScript(), {
                logger:"/home/module", 
                script:"/home/bootstrap_node"
            });
        });

        it("should return third and fourth paths of called function stack if no start slash or parentheses", () => {
            const logger = new Logger(loggerConfig);
            logger.getCallStack = sinon.stub().returns("Error: User is undefined\n  at Module.load module.js:565:32\n at tryModuleLoad module.js:505:12\n at Function.Module._load module.js:497:3\n at Function.Module.runMain module.js:693:10\n at startup bootstrap_node.js:188:16\n ");
            assert.deepEqual(logger.getPathsOfLoggerAndCallingScript(), {
                logger:"module", 
                script:"bootstrap_node"
            });
        });

        it("should return empty strings if no matches found", () => {
            const logger = new Logger(loggerConfig);
            logger.getCallStack = sinon.stub().returns("Error: User is undefined\n  at Module.load mo:32\n at tryModuleLoad mod505:12\n at Function.Module._load modul:497:3\n at Function.Module.runMain moduls:693:10\n at startup bootstrap_nods:188:16\n ");
            assert.deepEqual(logger.getPathsOfLoggerAndCallingScript(), {
                logger:"", 
                script:""
            });
        });
    });

    describe("#getTag", () => {
        it("should return part of script property that different from logger path with repalced / with .", () => {
            const logger = new Logger(loggerConfig);
            logger.getPathsOfLoggerAndCallingScript = sinon.stub().returns({
                logger:"/node_modules/mocha/lib/runnable", 
                script:"/node_modules/mocha/lib/bootstrap_node/other"
            });
            assert.deepEqual(logger.getTag(), "bootstrap_node.other");
        });
    });
});
