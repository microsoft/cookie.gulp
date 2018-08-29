import { write } from "fs";

//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/**
 * Check if value is number or not.
 * @param {()} value The value to check.
 * @returns {boolean} True if value is number. Otherwise, false.
 */
export function isNumber(value: any): value is number {
    return typeof value === "number" || value instanceof Number;
}

/**
 * Check if value is function or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is function. Otherwise, false.
 */
export function isFunction(value: any): value is Function {
    return typeof value === "function";
}

/**
 * Check if value is object or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is object and not null or undefined. Otherwise, false (null). 
 */
export function isObject(value: any): value is object {
    return value && (typeof value === "object" || value instanceof Object);
}

/**
 * Check if value is string or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is string. Otherwise, false.
 */
export function isString(value: any): value is string {
    return typeof value === "string" || value instanceof String;
}

/**
 * Check if value is null or undefined.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is null or undefined. Otherwise, false.
 */
export function isNullOrUndefined(value: any): value is null | undefined {
    return value === undefined || value === null;
}

export namespace string {
    /**
     * Check if the given string, value, is null/undefined/empty string.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string. Otherwise, false.
     */
    export function isNullUndefinedOrEmpty(value: any): boolean {
        if (value === undefined || value === null) {
            return true;
        }

        if (typeof value !== "string") {
            throw new TypeError(`value is not type of String but: ${typeof (value)}`);
        }

        return value === "";
    }

    /**
     * Check if the given string, value, is null/undefined/empty string/whitespaces.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string/whitespaces. Otherwise, false.
     */
    export function isNullUndefinedOrWhitespaces(value: any): boolean {
        if (value === undefined || value === null) {
            return true;
        }

        if (typeof value !== "string") {
            throw new TypeError(`value is not type of String but: ${typeof (value)}`);
        }

        return value.trim() === "";
    }

    /**
     * Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
     * Uses "{}" or "{<index>}" as placeholders.
     * @param format A composite format string.
     * @param args An object array that contains zero or more objects to format.
     * @returns {string} A copy of format in which the format items have been replaced by the string representation of the corresponding objects in args.
     */
    export function format(format: string, ...args: Array<any>): string {
        if (typeof format !== "string") {
            throw new Error("format must be a string");
        }

        if (!Array.isArray(args)) {
            throw new Error("args must be an array.");
        }

        if (args.length <= 0) {
            return format;
        }

        let matchIndex = -1;

        return format.replace(/(\{*)(\{(\d*)\})/gi,
            (substring, escapeChar, argIdentifier, argIndexStr) => {
                matchIndex++;

                if (escapeChar.length > 0) {
                    return argIdentifier;
                }

                let argIndex = argIndexStr.length === 0 ? matchIndex : parseInt(argIndexStr, 10);

                if (isNaN(argIndex) || argIndex < 0 || argIndex >= args.length) {
                    throw new Error(`Referenced arg index, '${argIndexStr}',is out of range of the args.`);
                }

                return args[argIndex];
            });
    }
}

export namespace array {
    /**
     * Check if the given array, value, is null/undefined/empty array (no element in the array).
     * @param {*} value The given array to check.
     * @returns {boolean} True if the array, value, is null/undefined/empty array. Otherwise, false.
     */
    export function isNullUndefinedOrEmpty(value: any): boolean {
        if (value === undefined || value === null) {
            return true;
        }

        if (!Array.isArray(value)) {
            throw new TypeError(`value is not type of Array but: ${typeof (value)}`);
        }

        return value.length <= 0;
    }
}

export type LogLevel = "verbose" | "info" | "warning" | "error" | "exception" | "critical";

export interface ILog {
    write(level: LogLevel, msg: any, ...args: Array<any>): void;
    verbose(arg0: any, ...args: Array<any>): void;
    info(arg0: any, ...args: Array<any>): void;
    warning(arg0: any, ...args: Array<any>): void;
    error(arg0: any, ...args: Array<any>): void;
    exception(arg0: any, ...args: Array<any>): void;
    critical(arg0: any, ...args: Array<any>): void;
}

declare global {
    interface StringConstructor {
        /**
         * Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
         * Uses "{}" or "{<index>}" as placeholders.
         * @param {Array<*>} An object array that contains zero or more objects to format.
         * @returns {string} A copy of format in which the format items have been replaced by the string representation of the corresponding objects in args.
         */
        format: (...args: Array<any>) => string;
    }

    const log: ILog;
}

String.format = function (...args: Array<any>): string {
    return string.format(this, args);
};

class Log implements ILog {
    verbose: (arg0: any, args: Array<any>) => void = this.write.bind(this, "verbose");

    info: (arg0: any, args: Array<any>) => void = this.write.bind(this, "info");

    warning: (arg0: any, args: Array<any>) => void = this.write.bind(this, "warning");

    error: (arg0: any, args: Array<any>) => void = this.write.bind(this, "error");

    exception: (arg0: any, args: Array<any>) => void = this.write.bind(this, "exception");
    
    critical: (arg0: any, args: Array<any>) => void = this.write.bind(this, "critical");

    constructor() {
        this.warning = this.write.bind(this, "warning");
    }

    public write(level: LogLevel, arg0: any, ...args: any[]): void {
        switch (level) {
            case "info":
                console.info(arg0, ...args);
                break;

            case "warning":
                console.warn(arg0, ...args);
                break;

            case "error":
                console.error(arg0, ...args);
                break;

            case "exception":
            case "critical":
                console.exception(arg0, ...args);
                break;

            case "verbose":
            default:
                console.log(arg0, ...args);
                break;
        }
    }
}

global["log"] = new Log();
