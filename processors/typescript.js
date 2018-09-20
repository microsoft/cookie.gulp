//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const ts = require("typescript");
const fs = require("fs");
const tmp = require("tmp");

const tsc = require("../components/tsc");
const utils = require("../utilities");
const log = require("../log");

/**
 * @typedef ITsConfig
 * @property {import("typescript").CompilerOptions} compilerOptions
 * @property {Array.<string>} [include]
 * @property {Array.<string>} [exclude]
 */

/**
 * @returns {ITsConfig}
 */
function loadTsConfigJson() {
    if (!fs.existsSync("./tsconfig.json")) {
        return {
            compilerOptions: {}
        };
    }

    return JSON.parse(fs.readFileSync("./tsconfig.json", "utf8"));
}

/**
 * 
 * @param {IMsiProcessorConfig} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function typescript(config, buildTarget, buildInfos, packageJson) {
    const tsconfig = loadTsConfigJson();

    if (utils.string.isNullUndefinedOrWhitespaces(tsconfig.compilerOptions.outDir)) {
        log.warning("TypeScript", "tsconfig.json", "tsconfig.json:outDir is not specified. A temp directory is created and assigned to it.");

        tsconfig.compilerOptions.outDir = tmp.dirSync({ dir: buildInfos.paths.intermediateDir, unsafeCleanup: true }).name;
    }

    const compilerOptionsParseResult = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, undefined);

    if (compilerOptionsParseResult.errors && compilerOptionsParseResult.errors.length > 0) {
        compilerOptionsParseResult.errors.forEach((error) => log.error(`[${error.category}]`, error.messageText));
        throw new Error("Failed to parse tsconfig.json:compilerOptions.");
    }

    return tsc.compile(compilerOptionsParseResult.options);
};
module.exports = typescript;
