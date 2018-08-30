//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import * as ts from "typescript";
import * as tsc from "../../components/tsc";
import * as fs from "fs";

interface ITsConfig {
    compilerOptions: ts.CompilerOptions;
    include?: Array<string>;
    exclude?: Array<string>;
}

function loadTsConfigJson(): Readonly<ITsConfig> {
    if (!fs.existsSync("./tsconfig.json")) {
        return {
            compilerOptions: {}
        };
    }

    return JSON.parse(fs.readFileSync("./tsconfig.json", "utf8"));
}

/**
 * The the globs for the typescript files.
 * @returns {Array.<string>} The globs for the typescript files.
 */
function getTypescriptsGlobs(tsconfig: ITsConfig) {
    /** @type {Array.<string>} */
    const globs = [];

    // Include
    if (Array.isArray(tsconfig.include)) {
        globs.push(...tsconfig.include);
    } else if (!isNullOrUndefined(tsconfig.include)) {
        throw new Error("tsconfig.include must be an array!");
    }

    // Exclude
    if (Array.isArray(tsconfig.exclude)) {
        tsconfig.exclude.forEach((pattern) => globs.push("!" + pattern));
    } else if (!isNullOrUndefined(tsconfig.include)) {
        throw new Error("tsconfig.exclude must be an array!");
    }

    return utilities.formGlobs(globs);
}

gulp.task("compile@typescript", () => {
    const tsconfig = loadTsConfigJson();
    const compilerOptionsParseResult = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, undefined);

    if (compilerOptionsParseResult.errors && compilerOptionsParseResult.errors.length > 0) {
        compilerOptionsParseResult.errors.forEach((error) => log.error(`[${error.category}]`, error.messageText));
    }

    gulp.src()
    tsc.compile(compilerOptionsParseResult.options);
});
