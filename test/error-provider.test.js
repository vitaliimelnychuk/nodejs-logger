const assert = require("chai").assert;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const bugsnag = require("bugsnag");
const ErrorProvider = proxyquire("../src/error-provider.js", {
});

describe("error-provider:config", () => {
    describe("#config", () => {
        it("should return config passed to constructor", () => {
            const config = {
                test_key: 1
            };
            const errorProvider = new ErrorProvider(config);
            assert.equal(errorProvider.config, config);
        });

        it("should return config passed to config setter", () => {
            const config = {
                test_key: 1
            };
            const errorProvider = new ErrorProvider({});
            errorProvider.config = config;
            assert.equal(errorProvider.config, config);
        });
    });

    describe("#params", () => {
        it("should return config params to constructor", () => {
            const params = {
                test_key: 1
            };
            const errorProvider = new ErrorProvider({}, params);
            assert.equal(errorProvider.params, params);
        });

        it("should return params passed to params setter", () => {
            const params = {
                test_key: 1
            };
            const errorProvider = new ErrorProvider({});
            errorProvider.params = params;
            assert.equal(errorProvider.params, params);
        });
    });

    describe("#write", () => {
        it("should bugsnag notify function with correct message", () => {
            const errorProvider = new ErrorProvider({});
            bugsnag.notify = sinon.stub();
            errorProvider.getErrorObj = sinon.stub();
            errorProvider.getErrorObj.returns({ err:"error", data: "test" });
            errorProvider.write({});
            var firstArgument = bugsnag.notify.getCall(0).args[0];
            var secondArgument = bugsnag.notify.getCall(0).args[1];
            assert.equal(firstArgument, "error");
            assert.equal(secondArgument, "test");
        });

    });

    describe("#getJSONorString", () => {
        it("should return json obj when string contain json", () => {
            const errorProvider = new ErrorProvider({});
            let jsonObj = { msg: "test", data: "data" };
            let jsonMsg = JSON.stringify(jsonObj);
            assert.deepEqual(errorProvider.getJSONorString(jsonMsg), jsonObj);
        });

        it("should return json obj when string do not contain json", () => {
            const errorProvider = new ErrorProvider({});
            assert.equal(errorProvider.getJSONorString("test"), "test");
        });
    });

    describe("#getErrorObj", () => {
        it("should return error obj with msg as error is not set", () => {
            const errorProvider = new ErrorProvider({});
            let jsonMsg = JSON.stringify({ msg: "test", data: {}, tag: "tag"  });
            assert.equal(errorProvider.getErrorObj(jsonMsg).err, "test");
        });

        it("should return object with undefined tag if data and tag is not set", () => {
            const errorProvider = new ErrorProvider({});
            let jsonMsg = JSON.stringify({ msg: "test", tag:"tag" });
            assert.deepEqual(errorProvider.getErrorObj(jsonMsg).data, { tag: "tag" });
        });

        it("should return error obj with text of error it is string", () => {
            const errorProvider = new ErrorProvider({});
            let jsonMsg = JSON.stringify({ err: "test", data: {} });
            assert.equal(errorProvider.getErrorObj(jsonMsg).err, "test");
        });

        it("should return undefined error when msg and err is not set", () => {
            const errorProvider = new ErrorProvider({});
            var error = new Error(undefined);
            let jsonMsg = JSON.stringify({
                err: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                data: "data"
            });
            let errorObj = errorProvider.getErrorObj(jsonMsg).err;
            errorObj = JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj));
            error = JSON.stringify(error, Object.getOwnPropertyNames(error));
            assert.deepEqual(errorObj, error);
        });

        it("should return error obj with error as error is set", () => {
            const errorProvider = new ErrorProvider({});
            var error = new Error("test");
            let jsonMsg = JSON.stringify({
                err: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                data: "data"
            });
            let errorObj = errorProvider.getErrorObj(jsonMsg).err;
            errorObj = JSON.stringify(errorObj, Object.getOwnPropertyNames(errorObj));
            error = JSON.stringify(error, Object.getOwnPropertyNames(error));
            assert.deepEqual(errorObj, error);
        });
        it("should return tag if it set in input", () => {
            const errorProvider = new ErrorProvider({});
            var error = new Error("test");
            let jsonMsg = JSON.stringify({
                err: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                data: {},
                tag: "tag"
            });
            let errorObj = errorProvider.getErrorObj(jsonMsg);
            assert.equal(errorObj.data.tag, "tag");
        });
        it("should return no tag if it not set in input", () => {
            const errorProvider = new ErrorProvider({});
            var error = new Error("test");
            let jsonMsg = JSON.stringify({
                err: JSON.stringify(error, Object.getOwnPropertyNames(error)),
                data: {}
            });
            let errorObj = errorProvider.getErrorObj(jsonMsg);
            assert.equal(errorObj.data.tag, undefined);
        });
    });
});
