//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/**
 * @class
 * @implements {ILog}
 */
class Log {
    constructor() {
        this.verbose = this.write.bind(this, "verbose");
        this.info = this.write.bind(this, "info");
        this.warning = this.write.bind(this, "warning");
        this.error = this.write.bind(this, "error");
        this.exception = this.write.bind(this, "exception");
        this.critical = this.write.bind(this, "critical");
        this.warning = this.write.bind(this, "warning");
    }

    /**
     * Write logs.
     * @param {LogLevel} level 
     * @param  {...any} args 
     */
    write(level, ...args) {
        /** @type {string} */
        const timestamp = `[${new Date().toLocaleISOString()}]`;

        switch (level) {
            case "info":
                console.info(timestamp, ...args);
                break;

            case "warning":
                console.warn(timestamp, ...args);
                break;

            case "error":
                console.error(timestamp, ...args);
                break;

            case "exception":
            case "critical":
                console.exception(timestamp, ...args);
                break;

            case "verbose":
            default:
                console.log(timestamp, ...args);
                break;
        }
    }
}

/** @type {ILog} */
const log = new Log();

module.exports = log;
