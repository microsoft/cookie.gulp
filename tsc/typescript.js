//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const ts = require("typescript");
const fs = require("fs");
const tsc = require("./tsc");
const log = require("cookie.gulp/log");
const fileSystem = require("donuts.node/fileSystem");

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
 * @param {IProcessorConfig} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function typescript(config, buildTarget, buildInfos, packageJson) {
    const tsconfig = loadTsConfigJson();

    if (!tsconfig.compilerOptions.outDir) {
        tsconfig.compilerOptions.outDir = fileSystem.tempDirSync(buildInfos.paths.intermediateDir);
    }

    const compilerOptionsParseResult = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, undefined);

    if (compilerOptionsParseResult.errors && compilerOptionsParseResult.errors.length > 0) {
        compilerOptionsParseResult.errors.forEach((error) => log.error(`[${error.category}]`, error.messageText));
        throw new Error("Failed to parse tsconfig.json:compilerOptions.");
    }

    return tsc(compilerOptionsParseResult.options);
};
module.exports = typescript;
