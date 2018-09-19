//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/**
 * Check if value is number or not.
 * @param {()} value The value to check.
 * @returns {boolean} True if value is number. Otherwise, false.
 */
export declare function isNumber(value: any): value is number;

/**
 * Check if value is function or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is function. Otherwise, false.
 */
export declare function isFunction(value: any): value is Function;

/**
 * Check if value is object or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is object and not null or undefined. Otherwise, false (null).
 */
export declare function isObject(value: any): value is object;

/**
 * Check if value is string or not.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is string. Otherwise, false.
 */
export declare function isString(value: any): value is string;

/**
 * Check if value is null or undefined.
 * @param {*} value The value to check.
 * @returns {boolean} True if value is null or undefined. Otherwise, false.
 */
export declare function isNullOrUndefined(value: any): value is null | undefined;

export declare namespace string {
    /**
     * Check if the given string, value, is null/undefined/empty string.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string. Otherwise, false.
     */
    function isNullUndefinedOrEmpty(value: any): boolean;

    /**
     * Check if the given string, value, is null/undefined/empty string/whitespaces.
     * @param {*} value The given string to check.
     * @returns {boolean} True if the given string, value, is null/undefined/empty string/whitespaces. Otherwise, false.
     */
    function isNullUndefinedOrWhitespaces(value: any): boolean;

    /**
     * Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
     * Uses "{}" or "{<index>}" as placeholders.
     * @param {string} format A composite format string.
     * @param {...any} args An object array that contains zero or more objects to format.
     * @returns {string} A copy of format in which the format items have been replaced by the string representation of the corresponding objects in args.
     */
    function format(format: string, ...args: Array<any>): string;
}

export declare namespace array {
    /**
     * Check if the given array, value, is null/undefined/empty array (no element in the array).
     * @param {*} value The given array to check.
     * @returns {boolean} True if the array, value, is null/undefined/empty array. Otherwise, false.
     */
    function isNullUndefinedOrEmpty(value: any): boolean;
}
export declare namespace object {
    /**
     * Check if the target object is empty.
     * @param target The object to be checked.
     * @returns {boolean} True if the object is empty. Otherwise, false.
     */
    function isEmpty(target: any): boolean;

    /**
     * Check if the target object is null/undefined/empty.
     * @param target The object to be checked.
     * @returns {boolean} True if the object is null/undefined/empty. Otherwise, false.
     */
    function isNullUndefinedOrEmpty(target: any): boolean;

    /**
     * Travel the object against the property path and return the value.
     * @param {any} target Target the object to travel.
     * @param {string} propertyPath The property path to travel along.
     * @param defaultValue The default value to return if the value doesn't exist.
     * @returns The value of the target property.
     */
    function getPropertyValue<T>(target: any, propertyPath: string, defaultValue?: T): T;
}

declare global {
    interface String {
        /**
         * Replaces the format item in a specified string with the string representation of a corresponding object in a specified array.
         * Uses "{}" or "{<index>}" as placeholders.
         * @param {Array.<any>} An object array that contains zero or more objects to format.
         * @returns {string} A copy of format in which the format items have been replaced by the string representation of the corresponding objects in args.
         */
        format: (...args: Array<any>) => string;
    }

    interface Date {
        /**
         *
         * @returns {string} The locale date in ISO format.
         */
        toLocaleISOString: () => string;
    }
}
