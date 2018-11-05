//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
const utils = require("donuts.node/utils");
const configs = require("../configs");
const { execSync } = require("child_process");

const TaskName = "npm@dep-version";

/**
 *  
 * @param {string} depName
 * @param {string} distTag 
 * @return {string}
 */
function getVersionFromNpm(depName, distTag) {
    /** @type {string} */
    const npmcmdFormat = `npm view {}@${distTag} version`;

    const npmcmd = utils.string.format(npmcmdFormat, depName);

    /** @type {string} */
    let distTagVersion;

    console.log("NPM", "Executing", `${configs.buildInfos.paths.buildDir}> ${npmcmd}`);
    console.log(distTagVersion = execSync(npmcmd, { cwd: configs.buildInfos.paths.buildDir, encoding: "utf8" }).trim());

    return distTagVersion;
}

/**
 *  
 * @param {string} depName
 * @param {string} distTag 
 * @return {string}
 */
function getVersionByGithubRelease(depName, distTag) {
    const matches = /^\@github-release\:([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\:([a-z0-9\-_\.]+)$/i.exec(distTag);

    if (!matches) {
        throw new Error(`disgTag, "${distTag}", is invalid. (Format: @github:<org>:<repo>)`);
    }

    return `https://github.com/${matches[1]}/${matches[2]}/releases/download/${depName}-${configs.buildInfos.buildNumber}/${depName}-${configs.buildInfos.buildNumber}.tgz`;
}

/** 
 * @typedef INpmDepVersionTaskConfig
 * @property {string|Array.<string>} [depNamePatterns]
 * @property {string} [distTag]
 */

gulp.task(TaskName, async () => {
    /** @type {INpmDepVersionTaskConfig} */
    const config = configs.buildInfos.configs.tasks["npm@dep-version"];
    const distTag = config.distTag || "latest";

    /** @type {Array.<RegExp>} */
    const depNamePatterns = [];

    if (utils.isString(config.depNamePatterns)) {
        depNamePatterns.push(new RegExp(config.depNamePatterns));

    } else if (Array.isArray(config.depNamePatterns)) {
        depNamePatterns.push(...config.depNamePatterns.map((pattern) => new RegExp(pattern)));

    } else if (!utils.isNullOrUndefined(config.depNamePatterns)) {
        throw new Error("depNamePatterns setting is invalid. Only string, string[] or null/undefined is accepted.");
    }

    /** @type {string} */
    const packageJsonPath = path.join(configs.buildInfos.paths.buildDir, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
        console.log(TaskName, "No package.json");
        return;
    }

    /** @type {IPackageConfig} */
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: "utf8" }));

    for (const depName in packageJson.dependencies) {
        if (depNamePatterns.length > 0
            && !depNamePatterns.find((regex) => regex.test(depName))) {
            continue;
        }

        /** @type {string} */
        let depVersion;

        if (distTag.startsWith("@github-release")) {
            depVersion = getVersionByGithubRelease(depName, distTag);

        } else {
            depVersion = getVersionFromNpm(depName, distTag);
        }

        packageJson.dependencies[depName] = `^${depVersion}`;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
});