//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/**
 * @typedef IDynamicDependency
 * @property {string} [version]
 * @property {Array.<DepType>} [depTypes]
 * @property {Array.<NodeJS.Architecture>} [archs]
 * @property {Array.<NodeJS.Platform>} [platforms]
 */

const cp = require("child_process");
const log = require("./log");
const configs = require("./configs");
const utils = require("donuts.node/utils");

/** @type {IDictionary.<string>} */
const ConditionMap = {
    "arch": "archs",
    "platform": "platforms"
};

const DepTypeToNpmArg = {
    dev: "-D",
    prod: "-P",
    optional: "-O",
    bundle: "-B"
};

/** @type {string} */
const LogCategory = "Dynamic-Dependency";

/**
 * Check if the module is installed.
 * @param {string} modulePath 
 * @returns {boolean} True if the module is installed. Otherwise, false.
 */
function isModuleInstalled(modulePath) {
    try {
        require.resolve(modulePath);

        return true;
    } catch (error) {
        if (error && error.code === "MODULE_NOT_FOUND") {
            return false;
        }

        throw error;
    }
}
exports.isModuleInstalled = isModuleInstalled;

/**
 * Check if the actual value matches the conditions.
 * @param {Array.<string>} matchedConditions 
 * @param {string} actualValue 
 * @returns {boolean|null} True if matched. Otherwise, false.
 */
function isConditionMatched(matchedConditions, actualValue) {
    if (utils.isNullOrUndefined(matchedConditions)) {
        return true;
    }

    return matchedConditions.includes(actualValue);
}

/**
 * Check if all the conditions are matched.
 * @param {string} depName 
 * @param {IDynamicDependency} dep 
 * @returns {boolean} True if all conditions are matched. Otherwise, false.
 */
function areConditionsMatched(depName, dep) {
    for (const propertyName in ConditionMap) {
        /** @type {Array.<string>} */
        const matchedConditions = utils.object.getPropertyValue(dep, ConditionMap[propertyName]);

        if (!Array.isArray(matchedConditions)) {
            log.warning(LogCategory, depName, `dep.${ConditionMap[propertyName]} is invalid. It must be an array of string. The condition is ignored.`);
            continue;
        }

        /** @type {string} */
        const actualValue = utils.object.getPropertyValue(process, propertyName);

        if (!isConditionMatched(matchedConditions, actualValue)) {
            log.info(LogCategory, depName, `Mismatch: ${propertyName} is ${utils.object.getPropertyValue(process, propertyName)}.`);

            return false;
        }
    }

    return true;
}

/**
 * 
 * @param {string} depName 
 * @param {IDynamicDependency} dep 
  */
function installDynamicDependency(depName, dep) {
    const npmCmd =
        utils.string.format(
            "npm install {}{} {}",
            depName,
            dep.version ? "@" + dep.version : "",
            Array.isArray(dep.depTypes)
                ? dep.depTypes.map((depType) => DepTypeToNpmArg[depType]).join(" ")
                : "");

    log.info(cp.execSync(npmCmd, { encoding: "utf8" }));
}
exports.installDynamicDependency = installDynamicDependency;

function installDynamicDependencies() {
    /** @type {IDictionary.<IDynamicDependency>} */
    const dynamicDeps = utils.object.getPropertyValue(configs.packageJson, "dynamicDependencies");

    if (utils.isNullOrUndefined(dynamicDeps)) {
        return;
    }

    if (Array.isArray(dynamicDeps) || typeof dynamicDeps !== "object") {
        throw new Error("packageJson:dynamicDependencies is invalid.");
    }

    for (const depName in dynamicDeps) {
        const dep = dynamicDeps[depName];

        if (isModuleInstalled(depName)) {
            continue;
        }

        if (!areConditionsMatched(depName, dep)) {
            log.info(LogCategory, depName, `Skipped: conditions are not matched.`);
            continue;
        }

        installDynamicDependency(depName, dep);
    }
}
exports.installDynamicDependencies = installDynamicDependencies;
