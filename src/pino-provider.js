const pino = require("pino");
const pinoms = require("pino-multi-stream");
const UdpStream = require("pino-socket/lib/UdpConnection");
const TcpStream = require("pino-socket/lib/TcpConnection");
const errorProvider = require("./error-provider");
const fs = require("fs");
const colors = require("colors/safe");

const needsMetadata = Symbol.for("needsMetadata");

colors.setTheme({
    info: "green",
    warn: "yellow",
    debug: "blue",
    error: "red"
});

class PinoProvider {
    constructor(config) {
        this.config = config;
        this.streams = [];
    }

    get config() {
        return this._config;
    }

    set config(config) {
        this._config = config;
    }

    get logger() {
        if (!this._logger) {
            this._logger = this.initLogger();
        }
        return this._logger;
    }

    set logger(logger) {
        this._logger = logger;
    }

    get streams() {
        return this._streams;
    }

    set streams(streams) {
        this._streams = streams;
    }

    static get minLevel() {
        return "trace";
    }

    initLogger() {
        const logger = pinoms({ level: PinoProvider.minLevel }, {
            timestamp: pino.stdTimeFunctions.slowTime,
            streams: this.getStreams(),
            write: this.writeStreams,
            [needsMetadata]:true,
        });
        return logger;
    }

    writeStreams(data) {
        var dest;
        var streams = this.streams;
        var stream;
        for (var i = 0; i < streams.length; i++) {
            dest = streams[i];
            stream = dest.stream;
            if (PinoProvider.isLevelAllowed(pino.levels.labels[this.lastLevel], dest.levels)) {
                stream.write(data);
            }
        }
    }

    getStreams() {
        if (this.isEnabled("console")) {
            this.streams.push(this.createConsoleStream());
        }
        if (this.isEnabled("file")) {
            this.streams.push(this.createFileStream());
        }
        if (this.isEnabled("logstash")) {
            this.streams.push(this.createLogstashStream());
        }
        if (this.isEnabled("bugsnag")) {
            this.streams.push(this.createBugsnagProvider());
        }
        return this.streams;
    }

    getPinoPretty(data, levelIn, formatterIn) {
        return pino.pretty({
            levelFirst: true,
            forceColor: true,
            level: levelIn,
            formatter: formatterIn.bind(data),
        });
    }

    getColoredLevel(level) {
        return colors[level](level);
    }

    createLogstashStream() {
        var logstashStream;
        const streamConfig = {
            port: this.config.transports.logstash.port,
            address: this.config.transports.logstash.host,
        };
        if (this.config.transports.logstash.type === "tcp") {
            logstashStream = TcpStream(streamConfig);
        }
        else {
            logstashStream = UdpStream(streamConfig);
        }
        const pretty = this.getPinoPretty(
            this,
            PinoProvider.minLevel,
            this.messageFormatterForLogstash
        );
        pretty.pipe(logstashStream);
        return {
            stream: pretty,
            streamToClose: logstashStream,
            level: PinoProvider.minLevel,
            levels: this.config.transports.logstash.level,
        };
    }

    createConsoleStream() {
        const pretty = this.getPinoPretty(
            this,
            PinoProvider.minLevel,
            this.messageFormatterForConsole
        );
        pretty.pipe(process.stdout);
        return {
            stream: pretty,
            level: PinoProvider.minLevel,
            levels: this.config.transports.console.level,
        };
    }

    createFileStream() {
        const pretty = this.getPinoPretty(
            this,
            PinoProvider.minLevel,
            this.messageFormatterForFile
        );
        pretty.pipe(fs.createWriteStream(
            this._config.transports.file.filepath,
            { flags: "a" }
        ));
        return {
            stream: pretty,
            level: PinoProvider.minLevel,
            levels: this.config.transports.file.level,
        };
    }

    createBugsnagProvider() {
        let params = {
            appVersion: this.config.version,
            releaseStage: this.config.env
        };
        var bugsnagProv = new errorProvider(this.config.transports.bugsnag, params);
        return {
            stream: bugsnagProv,
            level: PinoProvider.minLevel,
            levels: this.config.transports.bugsnag.level,
            needsMetadata:true,
        };
    }

    isEnabled(transport) {
        return Boolean(this.config.transports && this.config.transports[transport]);
    }

    messageFormatterForLogstash(dataIn) {
        let data = this.getValidInputData(dataIn);
        
        let output = {};
        var date = new Date(dataIn.time);
        Object.assign(output, dataIn, data, {
            timeString: date.toString(),
            level: pino.levels.labels[dataIn.level],
        });
        return JSON.stringify(output);
    }
    
    getValidInputData(dataIn) {
        let data = {
            msg: dataIn.msg,
            tag: dataIn.tag,
            label: dataIn.label,
            data: dataIn.data ? Object.assign({}, dataIn.data, {
                version : this.config.version,
                env : this.config.env
            }) : {},
        };
        return data;
    }

    messageFormatterForFile(dataIn) {
        let data = this.getValidInputData(dataIn);
        return `${this.formatDate(this.getCurrentDate())} ${pino.levels.labels[dataIn.level].toUpperCase()} ${data.label} / ${data.tag} "${data.msg}", ${JSON.stringify(data.data)}`;
    }

    messageFormatterForConsole(dataIn) {
        let data = this.getValidInputData(dataIn);
        return `${this.getColoredLevel(pino.levels.labels[dataIn.level])}: ${data.label} / ${data.tag} "${data.msg}", ${JSON.stringify(data.data)}`;
    }

    //returns now
    /* istanbul ignore next */
    getCurrentDate() {
        return new Date();
    }

    formatDate(date) {
        return date.toISOString().substring(0, 19).replace("T", " ");
    }

    static isLevelAllowed(currLevel, streamLevels) {
        if (!Array.isArray(streamLevels)) {
            streamLevels = Array(streamLevels);
        }
        return streamLevels.indexOf(currLevel) > -1;
    }
}

module.exports = PinoProvider;
