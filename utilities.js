"use strict";
//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check if value is number or not.
 * @param {()} value The value to check.
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
    return typeof value === "string" || value instanceof String;
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
var string;
(function (string) {
    /**
     * Check if the given string, value, is null/undefined/empty string.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string. Otherwise, false.
     */
    function isNullUndefinedOrEmpty(value) {
        if (value === undefined || value === null) {
            return true;
        }
        if (typeof value !== "string") {
            throw new TypeError(`value is not type of String but: ${typeof (value)}`);
        }
        return value === "";
    }
    string.isNullUndefinedOrEmpty = isNullUndefinedOrEmpty;
    /**
     * Check if the given string, value, is null/undefined/empty string/whitespaces.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string/whitespaces. Otherwise, false.
     */
    function isNullUndefinedOrWhitespaces(value) {
        if (value === undefined || value === null) {
            return true;
        }
        if (typeof value !== "string") {
            throw new TypeError(`value is not type of String but: ${typeof (value)}`);
        }
        return value.trim() === "";
    }
    string.isNullUndefinedOrWhitespaces = isNullUndefinedOrWhitespaces;
    /**
     * Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
     * Uses "{}" or "{<index>}" as placeholders.
     * @param format A composite format string.
     * @param args An object array that contains zero or more objects to format.
     * @returns {string} A copy of format in which the format items have been replaced by the string representation of the corresponding objects in args.
     */
    function format(format, ...args) {
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
        return format.replace(/(\{*)(\{(\d*)\})/gi, (substring, escapeChar, argIdentifier, argIndexStr) => {
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
    string.format = format;
})(string = exports.string || (exports.string = {}));
var array;
(function (array) {
    /**
     * Check if the given array, value, is null/undefined/empty array (no element in the array).
     * @param {*} value The given array to check.
     * @returns {boolean} True if the array, value, is null/undefined/empty array. Otherwise, false.
     */
    function isNullUndefinedOrEmpty(value) {
        if (value === undefined || value === null) {
            return true;
        }
        if (!Array.isArray(value)) {
            throw new TypeError(`value is not type of Array but: ${typeof (value)}`);
        }
        return value.length <= 0;
    }
    array.isNullUndefinedOrEmpty = isNullUndefinedOrEmpty;
})(array = exports.array || (exports.array = {}));
var object;
(function (object) {
    /**
     * Check if the target object is empty.
     * @param target The object to be checked.
     * @returns {boolean} True if the object is empty. Otherwise, false.
     */
    function isEmpty(target) {
        // @ts-ignore: This is intended to improve the performance.
        for (const prop in target) {
            return false;
        }
        return true;
    }
    object.isEmpty = isEmpty;
    /**
     * Check if the target object is null/undefined/empty.
     * @param target The object to be checked.
     * @returns {boolean} True if the object is null/undefined/empty. Otherwise, false.
     */
    function isNullUndefinedOrEmpty(target) {
        if (!target) {
            return true;
        }
        // @ts-ignore: This is intended to improve the performance.
        for (const prop in target) {
            return false;
        }
        return true;
    }
    object.isNullUndefinedOrEmpty = isNullUndefinedOrEmpty;
    /**
     * Travel the object against the property path and return the value.
     * @param {any} target Target the object to travel.
     * @param {string} propertyPath The property path to travel along.
     * @param defaultValue The default value to return if the value doesn't exist.
     * @returns The value of the target property.
     */
    function getPropertyValue(target, propertyPath, defaultValue = undefined) {
        if (string.isNullUndefinedOrWhitespaces(propertyPath)) {
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
            }
            else {
                targetObj = targetObj[name];
            }
        }
        return targetObj;
    }
    object.getPropertyValue = getPropertyValue;
})(object = exports.object || (exports.object = {}));
String.format = function (...args) {
    return string.format(this, args);
};
function padLeft(num, length) {
    return num.toString().padStart(length, "0");
}
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
//# sourceMappingURL=utilities.js.map