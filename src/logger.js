const pinoProvider = require("./pino-provider");
const validator = require("./validator");

class Logger {
    constructor(config) {
        const validatorInfo = validator.getValidationInfo(config);
        if (validatorInfo.valid) {
            this.provider = new pinoProvider(config);
        } else {
            throw new Error(validatorInfo.errors[0].message);
        }
    }

    get provider() {
        return this._provider;
    }

    set provider(provider) {
        this._provider = provider;
    }

    get label() {
        return this.provider.config.app_name ? this.provider.config.app_name : "";
    }
    
    //function is ignored from coverage as it cannot be mocked 
    /* istanbul ignore next */
    getCallStack() {
        return new Error().stack;//getting call stack of current function
    }

    getPathsOfLoggerAndCallingScript() {
        let regex =  /(.([/|(])|([ ](?!.*[ ])))(.*)\..*/;
        let stackArr = this.getCallStack().split("\n");
        let logger = regex.exec(stackArr[4]) ? regex.exec(stackArr[4])[4] : "";
        let script = regex.exec(stackArr[5]) ? regex.exec(stackArr[5])[4] : "";
        return {logger, script};
    }

    getTag() {
        let paths = this.getPathsOfLoggerAndCallingScript();
        //iterate while the beginning is the same
        for(var i = 0; paths.script.length > i && paths.logger.length > i && paths.logger[i] === paths.script[i]; i++);
        //substring part with differences, and replacing all slashes with a dot
        return paths.script.substr(i, paths.script.length - 1).replace(/[/]/g, ".");
    }

    error(err = "", arrgs = {}) {
        return this.provider.logger.error({
            err: JSON.stringify(err, err ? Object.getOwnPropertyNames(err) : ""),
            data: arrgs,
            tag: this.getTag(),
            label: this.label
        }, err && err.message ? err.message : err);
    }

    warn(message = "", data = {}) {
        return this.provider.logger.warn({tag: this.getTag(), label: this.label, data}, message);
    }

    info(message = "", data = {}) {
        return this.provider.logger.info({tag: this.getTag(), label: this.label, data}, message);
    }

    debug(message = "", data = {}) {
        return this.provider.logger.debug({tag: this.getTag(), label: this.label, data}, message);
    }

    close() {
        this.provider.streams.forEach(element => {
            if(element.streamToClose) {
                element.streamToClose.close();
            }
        });
    }
}

module.exports = Logger;