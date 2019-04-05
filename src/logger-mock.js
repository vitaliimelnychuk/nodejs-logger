const sinon = require("sinon");

const logger = {
    error: sinon.spy(),
    warn: sinon.spy(),
    info: sinon.spy(),
    debug: sinon.spy(),
};

logger.restore = () => {
    logger.error.restore();
    logger.warn.restore();
    logger.info.restore();
    logger.debug.restore();
};
logger.reset = () => {
    logger.error.resetHistory();
    logger.warn.resetHistory();
    logger.info.resetHistory();
    logger.debug.resetHistory();
};

module.exports = logger;
