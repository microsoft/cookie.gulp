//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as cp from "child_process";

import * as log from "./log";
import * as configs from "./configs";
import * as utils from "./utilities";

const ConditionMap: IDictionary<string> = {
    "arch": "archs",
    "platform": "platforms"
};

const DepTypeToNpmArg = {
    dev: "-D",
    prod: "-P",
    optional: "-O",
    bundle: "-B"
};

const LogCategory = "Dynamic Dependency";

function isModuleInstalled(modulePath: string): boolean {
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

function isConditionMatched(matchedConditions: Array<string>, actualValue: string): boolean | null {
    if (utils.isNullOrUndefined(matchedConditions)) {
        return true;
    }

    if (!Array.isArray(matchedConditions)) {
        return null;
    }

    return matchedConditions.includes(actualValue);
}

function areConditionsMatched(depName: string, dep: IDynamicDependency): boolean {
    for (const propertyName in ConditionMap) {
        let matched =
            isConditionMatched(
                utils.object.getPropertyValue(dep, ConditionMap[propertyName]),
                utils.object.getPropertyValue(process, propertyName));

        if (matched === null) {
            log.warning(LogCategory, depName, `dep.${ConditionMap[propertyName]} is invalid. It must be an array of string. The condition is ignored.`);
            matched = true;
        }

        if (matched === false) {
            log.info(LogCategory, depName, `Mismatch: ${propertyName} is ${utils.object.getPropertyValue(process, propertyName)}.`);
            return false;
        }
    }

    return true;
}

function installDynamicDependency(depName: string, dep: IDynamicDependency): void {
    const npmCmd = String.format("npm install {}{} {}",
        depName,
        dep.version ? "@" + dep.version : "",
        Array.isArray(dep.depTypes) ? dep.depTypes.map((depType) => DepTypeToNpmArg[depType]).join(" ") : "");

    log.info(cp.execSync(npmCmd, { encoding: "utf8" }));
}

export function installDynamicDependencies(): void {
    const dynamicDeps = utils.object.getPropertyValue<IDictionary<IDynamicDependency>>(configs.packageJson, "dynamicDependencies");

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
