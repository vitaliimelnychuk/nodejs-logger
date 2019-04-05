const bugsnag = require("bugsnag");

class ErrorProvider {
    constructor(config, params) {
        this.config = config;
        this.params = params;
        this.initClient();
    }

    get config() {
        return this._config;
    }

    set config(config) {
        this._config = config;
    }

    get params() {
        return this._params;
    }

    set params(params) {
        this._params = params;
    }

    initClient() {
        bugsnag.register(this.config.api_key, this.params);
    }
    
    getJSONorString(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    }

    getErrorObj(msg) {
        var jsonInputObj = JSON.parse(msg);
        var errObj = jsonInputObj.err ? this.getJSONorString(jsonInputObj.err) : jsonInputObj.msg;
        if (typeof errObj !== "string") {
            let error = new Error();
            Object.assign(error, errObj);
            errObj = error;
        }
        return { err: errObj, data: this.getValidErrorData(jsonInputObj.data, jsonInputObj.tag) };
    }

    getValidErrorData(data, tag) {
        let output = {tag};
        if(typeof data === "string" && data)
            output.message = data;
        else
            output = Object.assign({}, output, data);
        return output;
    }

    write(msg) {
        let error = this.getErrorObj(msg);
        bugsnag.notify(error.err, error.data);
    }
}

module.exports = ErrorProvider;