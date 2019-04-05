const assert = require("chai").assert;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const PinoProvider = proxyquire("../src/pino-provider.js", {
    "pino": {},
});

// eslint-disable-next-line no-control-regex
const regexRemoveFormatting = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

describe("pino-provider:config", () => {
    describe("#config", () => {
        it("should return config passed to constructor", () => {
            const config = {
                test_key: 1
            };
            const pinoProvider = new PinoProvider(config);
            assert.equal(pinoProvider.config, config);
        });

        it("should return config passed to config setter", () => {
            const config = {
                test_key: 1
            };
            const pinoProvider = new PinoProvider({});
            pinoProvider.config = config;
            assert.equal(pinoProvider.config, config);
        });
    });

    describe("#streams", () => {
        it("should return streams passed to config setter", () => {
            const streams = {
                test_key: 1
            };
            const pinoProvider = new PinoProvider({});
            pinoProvider.streams = streams;
            assert.equal(pinoProvider.streams, streams);
        });
    });

    describe("#logger", () => {
        it("method initLogger should be called once", () => {
            const pinoProvider = new PinoProvider({});
            pinoProvider.initLogger = sinon.mock().returns(1);
            assert.equal(pinoProvider.logger, 1);
            assert.equal(pinoProvider.logger, 1);
            assert.isTrue(pinoProvider.initLogger.calledOnce);
        });

        it("method initLogger shouldn't be called", () => {
            const pinoProvider = new PinoProvider({});
            pinoProvider.initLogger = sinon.mock().returns(1);
            assert.equal(pinoProvider.logger, 1);
            assert.isTrue(pinoProvider.initLogger.called);
        });
    });

    describe("#getColoredLevel", () => {
        it("should return colored level for console", () => {
            const pinoProvider = new PinoProvider({});
            var formattedText = pinoProvider.getColoredLevel("debug");
            var justText = formattedText.replace(regexRemoveFormatting, "");
            assert.equal(justText, "debug");
        });
    });

    describe("#writeStreams", () => {
        it("should call write function", () => {
            const pinoProvider = new PinoProvider({
                transports: {
                    console: {
                        level: ["trace", "warn", "info", "debug"],
                    },
                },
            });
            const consoleStreamStub = {
                stream: { write: sinon.spy() },
                level: "trace",
                levels: pinoProvider.config.transports.console.level
            };
            const isLevelAllowedPrev = PinoProvider.isLevelAllowed;
            PinoProvider.isLevelAllowed = sinon.stub().returns(true);
            const write = consoleStreamStub.stream.write;
            pinoProvider.createConsoleStream = sinon.stub().returns(consoleStreamStub);
            pinoProvider.logger.debug("test", "some message", { "key": "value" });
            PinoProvider.isLevelAllowed = isLevelAllowedPrev;
            assert(write.called, "write should be called");
        });

        it("should not call write function", () => {
            const pinoProvider = new PinoProvider({
                transports: {
                    console: {
                        level: ["trace", "warn", "info", "debug"],
                    },
                },
            });
            const consoleStreamStub = {
                stream: { write: sinon.spy() },
                level: "trace",
                levels: pinoProvider.config.transports.console.level
            };
            const isLevelAllowedPrev = PinoProvider.isLevelAllowed;
            PinoProvider.isLevelAllowed = sinon.stub().returns(false);
            const write = consoleStreamStub.stream.write;
            pinoProvider.createConsoleStream = sinon.stub().returns(consoleStreamStub);
            pinoProvider.logger.debug("test", "some message", { "key": "value" });
            PinoProvider.isLevelAllowed = isLevelAllowedPrev;
            assert(!write.called, "write should not be called");
        });
    });

    describe("#isEnabled", () => {
        it("should return false when transport is disabled", () => {
            const pinoProvider = new PinoProvider({
                transports: {
                    console: false
                }
            });
            assert.isFalse(pinoProvider.isEnabled("console"));
        });
        it("should return false when transport is undefined", () => {
            const pinoProvider = new PinoProvider({ transports: {} });
            assert.isFalse(pinoProvider.isEnabled("console"));
        });
        it("should return false when there is no transports", () => {
            const pinoProvider = new PinoProvider({});
            assert.isFalse(pinoProvider.isEnabled("console"));
        });
        it("should return false when console transport is false", () => {
            const pinoProvider = new PinoProvider({ transports: { console: false } });
            assert.isFalse(pinoProvider.isEnabled("console"));
        });
        it("should return true when there is console transport", () => {
            const pinoProvider = new PinoProvider({ transports: { console: { level: "debug" } } });
            assert.isTrue(pinoProvider.isEnabled("console"));
        });
    });

    describe("#getStreams", () => {
        it("should return empty array if all transports are disabled", () => {
            const pinoProvider = new PinoProvider({});
            const isEnabledStub = sinon.stub().returns(false);
            pinoProvider.isEnabled = isEnabledStub;
            assert.isEmpty(pinoProvider.getStreams());
        });

        it("should return console stream", () => {
            const pinoProvider = new PinoProvider({});
            const consoleStreamStub = { someProps: 1 };
            const isEnabledStub = sinon.stub();
            isEnabledStub.withArgs("console").returns(true);
            isEnabledStub.withArgs("file").returns(false);
            pinoProvider.isEnabled = isEnabledStub;
            pinoProvider.createConsoleStream = sinon.stub().returns(consoleStreamStub);
            assert.lengthOf(pinoProvider.getStreams(), 1);
            assert.equal(pinoProvider.getStreams()[0], consoleStreamStub);
        });
        it("should return file stream", () => {
            const pinoProvider = new PinoProvider({});
            const fileStreamStub = { someProps: 1 };
            const isEnabledStub = sinon.stub();
            isEnabledStub.withArgs("console").returns(false);
            isEnabledStub.withArgs("file").returns(true);
            pinoProvider.isEnabled = isEnabledStub;
            pinoProvider.createFileStream = sinon.stub().returns(fileStreamStub);
            assert.lengthOf(pinoProvider.getStreams(), 1);
            assert.equal(pinoProvider.getStreams()[0], fileStreamStub);
        });
        it("should return logstash stream", () => {
            const pinoProvider = new PinoProvider({});
            const logstashStreamStub = { someProps: 1 };
            const isEnabledStub = sinon.stub();
            isEnabledStub.withArgs("console").returns(false);
            isEnabledStub.withArgs("file").returns(false);
            isEnabledStub.withArgs("logstash").returns(true);
            pinoProvider.isEnabled = isEnabledStub;
            pinoProvider.createLogstashStream = sinon.stub().returns(logstashStreamStub);
            assert.lengthOf(pinoProvider.getStreams(), 1);
            assert.equal(pinoProvider.getStreams()[0], logstashStreamStub);
        });
        it("should return bugsnag provider", () => {
            const pinoProvider = new PinoProvider({});
            const bugsnagProviderStub = { someProps: 1 };
            const isEnabledStub = sinon.stub();
            isEnabledStub.withArgs("console").returns(false);
            isEnabledStub.withArgs("file").returns(false);
            isEnabledStub.withArgs("bugsnag").returns(true);
            pinoProvider.isEnabled = isEnabledStub;
            pinoProvider.createBugsnagProvider = sinon.stub().returns(bugsnagProviderStub);
            assert.lengthOf(pinoProvider.getStreams(), 1);
            assert.equal(pinoProvider.getStreams()[0], bugsnagProviderStub);
        });
    });

    describe("#createLogstashStream", () => {
        it("should create UDP stream and return required output", () => {
            const UdpStub = sinon.stub().returns("test_udp_stub");
            const PinoProviderTest = proxyquire("../src/pino-provider.js", {
                "pino-socket/lib/UdpConnection": UdpStub
            });
            const pinoProvider = new PinoProviderTest({
                "transports":{
                    "logstash":{
                        "port":"test_port",
                        "host":"test_host",
                        "type":"udp",
                        "level":["error"]
                    }
                }
            });
            const prettyStub = {
                pipe: sinon.stub()
            };
            pinoProvider.getPinoPretty = sinon.stub().returns(prettyStub);
            
            assert.deepEqual(pinoProvider.createLogstashStream(), {
                stream:prettyStub,
                streamToClose:"test_udp_stub",
                level: PinoProviderTest.minLevel,
                levels: ["error"]
            });

            assert.isTrue(UdpStub.calledOnce);
            assert.deepEqual(UdpStub.getCall(0).args[0], {
                "port":"test_port",
                "address":"test_host"
            });

            assert.isTrue(pinoProvider.getPinoPretty.calledOnce);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[0], pinoProvider);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[1], PinoProviderTest.minLevel);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[2], pinoProvider.messageFormatterForLogstash);

            assert.isTrue(prettyStub.pipe.calledOnce);
            assert.equal(prettyStub.pipe.getCall(0).args[0], "test_udp_stub");
        });
        
        it("should create TCP stream and return required output", () => {
            const TcpStub = sinon.stub().returns("test_tcp_stub");
            const PinoProviderTest = proxyquire("../src/pino-provider.js", {
                "pino-socket/lib/TcpConnection": TcpStub
            });
            const pinoProvider = new PinoProviderTest({
                "transports":{
                    "logstash":{
                        "port":"test_port",
                        "host":"test_host",
                        "type":"tcp",
                        "level":["error"]
                    }
                }
            });
            const prettyStub = {
                pipe: sinon.stub()
            };
            pinoProvider.getPinoPretty = sinon.stub().returns(prettyStub);
            
            assert.deepEqual(pinoProvider.createLogstashStream(), {
                stream:prettyStub,
                streamToClose:"test_tcp_stub",
                level: PinoProviderTest.minLevel,
                levels: ["error"]
            });

            
            assert.isTrue(TcpStub.calledOnce);
            assert.deepEqual(TcpStub.getCall(0).args[0], {
                "port":"test_port",
                "address":"test_host"
            });

            assert.isTrue(pinoProvider.getPinoPretty.calledOnce);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[0], pinoProvider);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[1], PinoProviderTest.minLevel);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[2], pinoProvider.messageFormatterForLogstash);

            assert.isTrue(prettyStub.pipe.calledOnce);
            assert.equal(prettyStub.pipe.getCall(0).args[0], "test_tcp_stub");
        });
    });

    describe("#createBugsnagProvider", () => {
        it("should create bugsnag provider and return required output", () => {
            const errorObj = {error:"error provider"};
            const ErrorStub = sinon.stub().returns(errorObj);
            const PinoProviderTest = proxyquire("../src/pino-provider.js", {
                "./error-provider": ErrorStub,
            });
            const pinoProvider = new PinoProviderTest({
                "version":"1",
                "env":"test",
                "transports":{
                    "bugsnag":{
                        "level":["error"]
                    }
                }
            });
           
            assert.deepEqual(pinoProvider.createBugsnagProvider(), {
                stream: errorObj,
                level: PinoProviderTest.minLevel,
                levels: ["error"],
                needsMetadata:true
            });

            assert.isTrue(ErrorStub.calledOnce);
            assert.deepEqual(ErrorStub.getCall(0).args[0], pinoProvider.config.transports.bugsnag);
            assert.deepEqual(ErrorStub.getCall(0).args[1], {
                "appVersion":"1",
                "releaseStage":"test"
            });
        });
    });

    describe("#createFileStream", () => {
        it("should create file stream and return required output", () => {
            const FSStub = {
                createWriteStream: sinon.stub().returns("file stream")
            };
            const PinoProviderTest = proxyquire("../src/pino-provider.js", {
                "fs": FSStub
            });
            const pinoProvider = new PinoProviderTest({
                "transports":{
                    "file":{
                        "filepath":"path",
                        "level":["error"]
                    }
                }
            });
            const prettyStub = {
                pipe: sinon.stub()
            };
            pinoProvider.getPinoPretty = sinon.stub().returns(prettyStub);
            
            assert.deepEqual(pinoProvider.createFileStream(), {
                stream: prettyStub,
                level: PinoProviderTest.minLevel,
                levels: ["error"]
            });
            
            assert.isTrue(FSStub.createWriteStream.calledOnce);
            assert.deepEqual(FSStub.createWriteStream.getCall(0).args[0], "path");
            assert.deepEqual(FSStub.createWriteStream.getCall(0).args[1], { flags: "a" });

            assert.isTrue(pinoProvider.getPinoPretty.calledOnce);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[0], pinoProvider);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[1], PinoProviderTest.minLevel);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[2], pinoProvider.messageFormatterForFile);

            assert.isTrue(prettyStub.pipe.calledOnce);
            assert.equal(prettyStub.pipe.getCall(0).args[0], "file stream");
        });
    });

    describe("#createConsoleStream", () => {
        it("should create console stream and return required output", () => {
            const PinoProviderTest = proxyquire("../src/pino-provider.js", {});
            const pinoProvider = new PinoProviderTest({
                "transports":{
                    "console":{
                        "level":["error"]
                    }
                }
            });
            const prettyStub = {
                pipe: sinon.stub()
            };
            pinoProvider.getPinoPretty = sinon.stub().returns(prettyStub);
            
            assert.deepEqual(pinoProvider.createConsoleStream(), {
                stream: prettyStub,
                level: PinoProviderTest.minLevel,
                levels: ["error"]
            });

            assert.isTrue(pinoProvider.getPinoPretty.calledOnce);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[0], pinoProvider);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[1], PinoProviderTest.minLevel);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[2], pinoProvider.messageFormatterForConsole);

            assert.isTrue(prettyStub.pipe.calledOnce);
            assert.equal(prettyStub.pipe.getCall(0).args[0], process.stdout);
        });
    });

    describe("#messageFormatterForFile", () => {
        it("should return formatted message", () => {
            const PinoProviderTest = proxyquire("../src/pino-provider.js", {});
            const pinoProvider = new PinoProviderTest({});
            pinoProvider.getCurrentDate = sinon.stub().returns(new Date("2018-11-26T10:57:19.277Z"));
            assert.deepEqual(pinoProvider.messageFormatterForFile({
                "label":"test_label",
                "tag":"test_tag",
                "level":40,
                "msg":"test_msg",
                "data":{"data":"test_data"}
            }), "2018-11-26 10:57:19 WARN test_label / test_tag \"test_msg\", {\"data\":\"test_data\"}");
        });
    });

    describe("#createConsoleStream", () => {
        it("should create console stream and return required output", () => {
            const PinoProviderTest = proxyquire("../src/pino-provider.js", {});
            const pinoProvider = new PinoProviderTest({
                "transports":{
                    "console":{
                        "level":["error"]
                    }
                }
            });
            const prettyStub = {
                pipe: sinon.stub()
            };
            pinoProvider.getPinoPretty = sinon.stub().returns(prettyStub);
            
            assert.deepEqual(pinoProvider.createConsoleStream(), {
                stream: prettyStub,
                level: PinoProviderTest.minLevel,
                levels: ["error"]
            });

            assert.isTrue(pinoProvider.getPinoPretty.calledOnce);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[0], pinoProvider);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[1], PinoProviderTest.minLevel);
            assert.deepEqual(pinoProvider.getPinoPretty.getCall(0).args[2], pinoProvider.messageFormatterForConsole);

            assert.isTrue(prettyStub.pipe.calledOnce);
            assert.equal(prettyStub.pipe.getCall(0).args[0], process.stdout);
        });
    });

    describe("#formatDate", () => {
        it("should return formatted date", () => {
            const pinoProvider = new PinoProvider({});
            const date = new Date("2018-11-26T10:57:19.277Z");
            assert.equal(pinoProvider.formatDate(date), "2018-11-26 10:57:19");
        });
    });
    describe("#messageFormatterForConsole", () => {
        it("should return correct message for console", () => {
            const pinoProvider = new PinoProvider({});
            var formattedText = pinoProvider.messageFormatterForConsole({
                msg: "test \"some message: {\"key\":\"value\"}\"",
                level: 20,
                tag: "",
                label: "label",
                data: {}
            });
            var justText = formattedText.replace(regexRemoveFormatting, "");
            assert.equal(justText, "debug: label /  \"test \"some message: {\"key\":\"value\"}\"\", {}");

        });
        it("should return correct message for console if message is empty", () => {
            const pinoProvider = new PinoProvider({});
            var formattedText = pinoProvider.messageFormatterForConsole({
                msg: "",
                level: 20,//debug
                data: {},
                label: "label",
                tag: ""
            });
            var justText = formattedText.replace(regexRemoveFormatting, "");
            assert.equal(justText, "debug: label /  \"\", {}");
        });
    });
    describe("#getValigInputData", () => {
        it("should return correct object with tag if error", () => {
            const pinoProvider = new PinoProvider({});
            var out = pinoProvider.getValidInputData({
                err: "test",
                msg: "msg",
                data: {value:"data"},
                tag: "tag"
            });
            assert.deepEqual(JSON.stringify(out), JSON.stringify({msg:"msg", tag:"tag", data:{value:"data"}}));
        });
        it("should return correct object with tag if not error", () => {
            const pinoProvider = new PinoProvider({});
            var out = pinoProvider.getValidInputData({
                tag: "test",
                msg: "msg",
                data: {value:"data"},
            });
            assert.deepEqual(JSON.stringify(out), JSON.stringify({ msg:"msg", tag:"test", data: {value:"data"}}));
        });
    });
    describe("#messageFormatterForLogstash", () => {
        it("should return correct message for logstash", () => {
            const pinoProvider = new PinoProvider({});
            assert.equal(pinoProvider.messageFormatterForLogstash({
                msg: "test \"some message: {\"key\":\"value\"}\"",
                level: 20,//debug
                time: 1526568277374
            }), "{\"msg\":\"test \\\"some message: {\\\"key\\\":\\\"value\\\"}\\\"\",\"level\":\"debug\",\"time\":1526568277374,\"data\":{},\"timeString\":\"Thu May 17 2018 17:44:37 GMT+0300 (EEST)\"}");
        });
        it("should return correct message for logstash if message is empty", () => {
            const pinoProvider = new PinoProvider({});
            assert.equal(pinoProvider.messageFormatterForLogstash({
                msg: "",
                level: 20,//debug
                time: 1526568277374
            }), "{\"msg\":\"\",\"level\":\"debug\",\"time\":1526568277374,\"data\":{},\"timeString\":\"Thu May 17 2018 17:44:37 GMT+0300 (EEST)\"}");
        });
    });

    describe("#isLevelAllowed", () => {
        it("should return true if current level is in levels", () => {
            assert.isTrue(PinoProvider.isLevelAllowed("debug", ["trace", "debug"]));
        });
        it("should return false if current level is not in levels", () => {
            assert.isFalse(PinoProvider.isLevelAllowed("debug", ["trace", "info"]));
        });
        it("should return true if current level it is levels", () => {
            assert.isTrue(PinoProvider.isLevelAllowed("debug", "debug"));
        });
        it("should return false if current level it is not levels", () => {
            assert.isFalse(PinoProvider.isLevelAllowed("debug", "info"));
        });
    });
});
