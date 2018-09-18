//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as fs from "fs";

import * as log from "./log";
import * as utils from "./utilities";

const buildInfosJsonPath = "./buildinfos.json";
const packageJsonPath = "./package.json";

function loadBuildInfosJson(): Readonly<IBuildInfos> {
    if (!fs.existsSync(buildInfosJsonPath)) {
        return {};
    }

    return JSON.parse(fs.readFileSync(buildInfosJsonPath, "utf8"));
}

function loadPackageJson(): Readonly<IPackageConfig> {
    if (!fs.existsSync(packageJsonPath)) {
        return {};
    }

    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

function generateBuildInfos(): IBuildInfos {
    const buildInfos: IBuildInfos = JSON.parse(JSON.stringify(buildInfosJson));

    log.info("Config", "BuildInfos", "Generating runtime buildinfos ...");

    buildInfos.productName = buildInfos.productName || packageJson.name;
    buildInfos.executableName = buildInfos.executableName || packageJson.name;
    buildInfos.description = buildInfos.description || packageJson.description;
    buildInfos.copyright = buildInfos.copyright || `Copyright (c) ${packageJson.author}.`;

    /**
     * buildNumber
     */
    if (buildInfos.buildNumber === "*") {
        log.info("Config", "BuildInfos", "evn:BUILD_BUILDNUMBER", "=", process.env["BUILD_BUILDNUMBER"]);
        log.info("Config", "BuildInfos", "package.json:version", "=", packageJson.version);
        buildInfos.buildNumber = process.env["BUILD_BUILDNUMBER"] || packageJson.version;
        log.info("Config", "BuildInfos", "buildInfos:buildNumber", "=", buildInfos.buildNumber);
    }

    /**
     * paths
     */
    if (!buildInfos.paths) {
        buildInfos.paths = Object.create(null);
    }

    if (!buildInfos.targets) {
        buildInfos.targets = Object.create(null);
    }

    // buildDir
    if (utils.isNullOrUndefined(buildInfos.paths.buildDir)) {
        buildInfos.paths.buildDir = "/build/out";
    }

    if (utils.string.isNullUndefinedOrWhitespaces(buildInfos.paths.buildDir)) {
        throw new Error(`${buildInfosJsonPath}:paths.buildDir must be specified.`);
    }

    // publishDir
    if (utils.isNullOrUndefined(buildInfos.paths.publishDir)) {
        buildInfos.paths.publishDir = "/publish";
    }

    if (utils.string.isNullUndefinedOrWhitespaces(buildInfos.paths.publishDir)) {
        throw new Error(`${buildInfosJsonPath}:paths.publishDir must be specified.`);
    }

    // intermediateDir
    if (utils.isNullOrUndefined(buildInfos.paths.intermediateDir)) {
        buildInfos.paths.intermediateDir = "/build/tmp";
    }

    if (utils.string.isNullUndefinedOrWhitespaces(buildInfos.paths.intermediateDir)) {
        throw new Error(`${buildInfosJsonPath}:paths.intermediateDir must be specified.`);
    }

    /**
     * configs
     */
    buildInfos.configs = buildInfos.configs || Object.create(null);
    buildInfos.configs.tasks = buildInfos.configs.tasks || Object.create(null);
    buildInfos.configs.processors = buildInfos.configs.processors || Object.create(null);

    /**
     * targets
     */
    if (!buildInfos.targets) {
        buildInfos.targets = [];
    }

    /**
     * tasks
     */
    if (!buildInfos.tasks) {
        buildInfos.tasks = Object.create(null);
    }

    log.info("Config", "BuildInfos", "Generating runtime buildinfos.");

    return buildInfos;
}

export const packageJson = loadPackageJson();
export const buildInfosJson = loadBuildInfosJson();

export const buildInfos = generateBuildInfos();
