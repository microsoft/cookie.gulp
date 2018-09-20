//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/**
 * Check if value is number or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is number. Otherwise, false.
 */
function isNumber(value) {
    return typeof value === "number" || value instanceof Number;
}
exports.isNumber = isNumber;

/**
 * Check if value is function or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is function. Otherwise, false.
 */
function isFunction(value) {
    return typeof value === "function";
}
exports.isFunction = isFunction;

/**
 * Check if value is object or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is object and not null or undefined. Otherwise, false (null).
 */
function isObject(value) {
    return value && (typeof value === "object" || value instanceof Object);
}
exports.isObject = isObject;

/**
 * Check if value is string or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is string. Otherwise, false.
 */
function isString(value) {
    return typeof value === "string" || value instanceof global.String;
}
exports.isString = isString;

/**
 * Check if value is null or undefined.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is null or undefined. Otherwise, false.
 */
function isNullOrUndefined(value) {
    return value === undefined || value === null;
}
exports.isNullOrUndefined = isNullOrUndefined;

exports.string = {
    /**
     * Check if the given string, value, is null/undefined/empty string.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string. Otherwise, false.
     */
    isNullUndefinedOrEmpty(value) {
        if (value === undefined || value === null) {
            return true;
        }

        if (typeof value !== "string") {
            throw new TypeError(`value is not type of String but: ${typeof (value)}`);
        }

        return value === "";
    },

    /**
     * Check if the given string, value, is null/undefined/empty string/whitespaces.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string/whitespaces. Otherwise, false.
     */
    isNullUndefinedOrWhitespaces(value) {
        if (value === undefined || value === null) {
            return true;
        }

        if (typeof value !== "string") {
            throw new TypeError(`value is not type of String but: ${typeof (value)}`);
        }

        return value.trim() === "";
    },

    /**
     * Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
     * Uses "{}" or "{<index>}" as placeholders.
     * @param {string} format A composite format string.
     * @param {...any} args An object array that contains zero or more objects to format.
     * @returns {string} A copy of format in which the format items have been replaced by the string representation of the corresponding objects in args.
     */
    format(format, ...args) {
        if (typeof format !== "string") {
            throw new Error("format must be a string");
        }

        if (!Array.isArray(args)) {
            throw new Error("args must be an array.");
        }

        if (args.length <= 0) {
            return format;
        }

        /** @type {number} */
        let matchIndex = -1;

        return format.replace(
            /(\{*)(\{(\d*)\})/gi,
            /**
             * @param {string} substring
             * @param {string} escapeChar
             * @param {string} argIdentifier
             * @param {string} argIndexStr
             */
            (substring, escapeChar, argIdentifier, argIndexStr) => {
                matchIndex++;

                if (escapeChar.length > 0) {
                    return argIdentifier;
                }

                let argIndex = argIndexStr.length === 0 ? matchIndex : parseInt(argIndexStr, 10);

                if (isNaN(argIndex) || argIndex < 0 || argIndex >= args.length) {
                    throw new Error(`Referenced arg index, "${argIndexStr}",is out of range of the args.`);
                }

                return args[argIndex];
            });
    }
}

exports.array = {
    /**
     * Check if the given array, value, is null/undefined/empty array (no element in the array).
     * @param {*} value The given array to check.
     * @returns {boolean} True if the array, value, is null/undefined/empty array. Otherwise, false.
     */
    isNullUndefinedOrEmpty(value) {
        if (value === undefined || value === null) {
            return true;
        }

        if (!Array.isArray(value)) {
            throw new TypeError(`value is not type of Array but: ${typeof (value)}`);
        }

        return value.length <= 0;
    }
};

exports.object = {
    /**
     * Check if the target object is empty.
     * @param {*} target The object to be checked.
     * @returns {boolean} True if the object is empty. Otherwise, false.
     */
    isEmpty(target) {
        // @ts-ignore: This is intended to improve the performance.
        for (const prop in target) {
            return false;
        }

        return true;
    },

    /**
     * Check if the target object is null/undefined/empty.
     * @param {*} target The object to be checked.
     * @returns {boolean} True if the object is null/undefined/empty. Otherwise, false.
     */
    isNullUndefinedOrEmpty(target) {
        if (!target) {
            return true;
        }

        // @ts-ignore: This is intended to improve the performance.
        for (const prop in target) {
            return false;
        }

        return true;
    },

    /**
     * Travel the object against the property path and return the value.
     * @template T
     * @param {*} target Target the object to travel.
     * @param {string} propertyPath The property path to travel along.
     * @param {T} defaultValue The default value to return if the value doesn't exist.
     * @returns {T} The value of the target property.
     */
    getPropertyValue(target, propertyPath, defaultValue = undefined) {
        if (exports.string.isNullUndefinedOrWhitespaces(propertyPath)) {
            throw new Error("Invalid propertyPath.");
        }

        if (isNullOrUndefined(target)) {
            return defaultValue;
        }

        const propertyNames = propertyPath.split(".");
        let targetObj = target;

        for (const name of propertyNames) {
            if (targetObj === undefined || targetObj === null) {
                return defaultValue;
            } else {
                targetObj = targetObj[name];
            }
        }

        return targetObj;
    }
};

/**
 * 
 * @param  {...any} args 
 * @returns {string}
 */
String.prototype.format = function (...args) {
    // @ts-ignore
    return exports.string.format(this, args);
};

/**
 * 
 * @param {number} num 
 * @param {number} length 
 * @returns {string}
 */
function padLeft(num, length) {
    return num.toString().padStart(length, "0");
}

/**
 * @returns {string}
 */
Date.prototype.toLocaleISOString = function () {
    return this.getUTCFullYear() +
        "-" + padLeft(this.getMonth(), 2) +
        "-" + padLeft(this.getDate(), 2) +
        "T" + padLeft(this.getHours(), 2) +
        ":" + padLeft(this.getMinutes(), 2) +
        ":" + padLeft(this.getSeconds(), 2) +
        "." + (this.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        (this.getTimezoneOffset() === 0 ? "Z" : "");
};
