//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as fs from "fs";

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

    log.info("[Begin]", "Generating runtime buildinfos ...");

    if (buildInfos.buildNumber === "*") {
        log.info("Read", "evn:BUILD_BUILDNUMBER", "=", process.env["BUILD_BUILDNUMBER"]);
        log.info("Read", "package.json:version", "=", packageJson.version);
        buildInfos.buildNumber = process.env["BUILD_BUILDNUMBER"] || packageJson.version;
        log.info("Write", "buildInfos:buildNumber", "=", buildInfos.buildNumber);
    }

    log.info("[Ended]", "Generating runtime buildinfos.");

    return buildInfos;
}

export const packageJson = loadPackageJson();
export const buildInfosJson = loadBuildInfosJson();
export const buildInfos = generateBuildInfos();

