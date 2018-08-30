//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare global {
    const log: ILog;
}

export type LogLevel = "verbose" | "info" | "warning" | "error" | "exception" | "critical";

export interface ILog {
    write(level: LogLevel, msg: any, ...args: Array<any>): void;
    verbose(...args: Array<any>): void;
    info(...args: Array<any>): void;
    warning(...args: Array<any>): void;
    error(...args: Array<any>): void;
    exception(...args: Array<any>): void;
    critical(...args: Array<any>): void;
}

class Log implements ILog {

    verbose: (args: Array<any>) => void = this.write.bind(this, "verbose");

    info: (args: Array<any>) => void = this.write.bind(this, "info");

    warning: (args: Array<any>) => void = this.write.bind(this, "warning");

    error: (args: Array<any>) => void = this.write.bind(this, "error");

    exception: (args: Array<any>) => void = this.write.bind(this, "exception");
    
    critical: (args: Array<any>) => void = this.write.bind(this, "critical");

    constructor() {
        this.warning = this.write.bind(this, "warning");
    }

    public write(level: LogLevel, ...args: any[]): void {
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

global["log"] = new Log();
