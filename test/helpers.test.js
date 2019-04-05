const assert = require("chai").assert;
const sinon = require("sinon");

const helpers = require("../src/helpers.js");

describe("helpers", () => {
    describe("#runWithTimer", () => {
        it("should respond with operationTime value", () => {
            const now = new Date();
            const clock = sinon.useFakeTimers(now.getTime());
            const promiseFunctionMock = sinon.stub().returns(Promise.resolve(1));
            return helpers.runWithTimer(promiseFunctionMock())
                .then(res => {
                    assert.deepEqual(res.data, 1);
                    assert.deepEqual(res.operationTime, 0);
                    clock.restore();
                });
        });
    });
});
