//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/**
 * @typedef {"x86"|"x64"|"ia64"} MsiArch
 * 
 */

/** @type {string} */
const VarName_MsiVersion = "MSIVERSION";

/**
 * 
 * @param {IBuildInfos} buildInfos 
 */
function generateMsiVersion(buildInfos) {
    const semver = require("semver");

    if (!semver.valid(buildInfos.buildNumber)) {
        throw new Error("Invalid build number (not semver format).");
    }

    const version = new semver.SemVer(buildInfos.buildNumber);

    return `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
}

/**
 * 
 * @param {NodeJS.Architecture} arch 
 * @returns {MsiArch}
 */
function toMsiArch(arch) {
    switch (arch) {
        case "x32":
            return "x86";

        case "x64":
            return "x64";

        default:
            throw new Error(`Unsupported architecture: ${arch}`);
    }
}

/**
 * 
 * @param {IMsiProcessorConfig} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function msi(config, buildTarget, buildInfos, packageJson) {
    const log = require("cookie.gulp/log");
    const { PassThrough } = require("stream");
    
    if (process.platform !== "win32") {
        log.warning("MSI", "Target", "Skipping: Publishing MSI must be on win32.");
        return new PassThrough({ objectMode: true });
    }

    if (buildTarget.platform !== "win32") {
        log.error("MSI", "Target", "Skipping: BuildTarget.platform must be win32.");
        return new PassThrough({ objectMode: true });
    }

    if (buildTarget.arch !== "x32"
        && buildTarget.arch !== "x64") {
        log.error("MSI", "Target", "Skpping: BuildTarget.arch must be x32 or x64.");
    }

    config.variables = config.variables || Object.create(null);

    if (!config.variables[VarName_MsiVersion]) {
        config.variables[VarName_MsiVersion] = generateMsiVersion(buildInfos);
        log.info("MSI", "Variable", `${VarName_MsiVersion}="${config.variables[VarName_MsiVersion]}"`);
    }

    const gulp = require("gulp");
    const globUtils = require("cookie.gulp/glob-utils");
    const { chain } = require("cookie.gulp/steams-utils");
    const light = require("./light");
    const candle = require("./candle");
    const heat = require("./heat");

    return chain(
        heat({
            intermediateDir: buildInfos.paths.intermediateDir,
            autoGenerateComponentGuids: config.autoGenerateComponentGuids,
            generateGuidsNow: config.generateGuidsNow,
            keepEmptyFolders: config.keepEmptyFolders,
            rootDirectory: config.rootDirectory,
            componentGroupName: config.componentGroupName,
            xsltTemplatePath: config.xsltTemplatePath
        }),

        gulp.src(config.wxs ? globUtils.toGlobs(config.wxs, "wxs") : "**/*.wxs", { dot: true }),

        // @ts-ignore
        candle({
            intermediateDir: buildInfos.paths.intermediateDir,
            arch: toMsiArch(buildTarget.arch),
            variables: config.variables
        }),

        light({
            intermediateDir: buildInfos.paths.intermediateDir,
            spdb: config.spdb,
            outFileName: `setup-${config.variables[VarName_MsiVersion]}.${buildTarget.arch}.msi`
        }));
};
module.exports = msi;
