//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import * as ts from "typescript";
import * as fs from "fs";
import * as tmp from "tmp";

import * as tsc from "../../components/tsc";
import * as utils from "../../utilities";
import * as gulpUtils from "../../glob-utils";
import { buildInfos } from "../../configs";
import * as log from "../../log";

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

function writeTsConfigJson(tsconfig: Readonly<ITsConfig>): void {
    fs.writeFileSync("./tsconfig.json", JSON.stringify(tsconfig, undefined, 4), "utf8");
}

/**
 * The the globs for the typescript files.
 * @returns {Array.<string>} The globs for the typescript files.
 */
function toGlobs(tsconfig: ITsConfig): Array<string> {
    /** @type {Array.<string>} */
    const globs = [];

    // Include
    if (Array.isArray(tsconfig.include)) {
        globs.push(...tsconfig.include);
    } else if (!utils.isNullOrUndefined(tsconfig.include)) {
        throw new Error("tsconfig.include must be an array!");
    }

    // Exclude
    if (Array.isArray(tsconfig.exclude)) {
        tsconfig.exclude.forEach((pattern) => globs.push("!" + pattern));
    } else if (!utils.isNullOrUndefined(tsconfig.include)) {
        throw new Error("tsconfig.exclude must be an array!");
    }

    return gulpUtils.formGlobs(...globs);
}

gulp.task("compile@typescript", () => {
    const tsconfig = loadTsConfigJson();

    if (utils.string.isNullUndefinedOrWhitespaces(tsconfig.compilerOptions.outDir)) {
        log.warning("tsconfig.json:outDir is not specified. A temp directory is created and assigned to it.");
        tsconfig.compilerOptions.outDir = tmp.dirSync().name;
        writeTsConfigJson(tsconfig);
    }

    const compilerOptionsParseResult = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, undefined);

    if (compilerOptionsParseResult.errors && compilerOptionsParseResult.errors.length > 0) {
        compilerOptionsParseResult.errors.forEach((error) => log.error(`[${error.category}]`, error.messageText));
        throw new Error("Failed to parse tsconfig.json:compilerOptions.");
    }

    return gulp.src(toGlobs(tsconfig))
        .pipe(tsc.compile(compilerOptionsParseResult.options))
        .pipe(gulp.dest(buildInfos.paths.destDir));
});
