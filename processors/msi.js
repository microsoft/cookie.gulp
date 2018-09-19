//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const gulp = require("gulp");
const { PassThrough } = require("stream");
const semver = require("semver");

const log = require("../log");
const globUtils = require("../glob-utils");
const wix = require("../components/wix");
const { chain } = require("../steams-utils");

/** @type {string} */
const VarName_MsiVersion = "MSIVERSION";

/**
 * 
 * @param {IBuildInfos} buildInfos 
 */
function generateMsiVersion(buildInfos) {
    if (!semver.valid(buildInfos.buildNumber)) {
        throw new Error("Invalid build number (not semver format).");
    }

    const version = new semver.SemVer(buildInfos.buildNumber);

    return `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
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
    if (process.platform !== "win32") {
        log.warning("MSI", "Target", "Skipping: Publishing MSI must be on win32.");
        return new PassThrough();
    }
    
    if (buildTarget.platform !== "win32") {
        log.error("MSI", "Target", "Skipping: BuildTarget.platform must be win32.");
        return new PassThrough();
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

    return chain(
        wix.heat({
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
        wix.candle({
            intermediateDir: buildInfos.paths.intermediateDir,
            arch: buildTarget.arch,
            variables: config.variables
        }),

        wix.light({
            intermediateDir: buildInfos.paths.intermediateDir,
            spdb: config.spdb,
            outFileName: `setup-${config.variables[VarName_MsiVersion]}.${buildTarget.arch}.msi`
        }));
};
module.exports = msi;
