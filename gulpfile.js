//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

"use strict";

const gulp = require("gulp");
const del = require("del");
const { Transform } = require("stream");

/**
 * @typedef ITsConfig 
 * @property {import("typescript").CompilerOptions} compilerOptions
 * @property {Array.<string>} [include]
 * @property {Array.<string>} [exclude]
 */

/**
 * @returns {Readonly.<ITsConfig>}
 */
function loadTsConfigJson() {
    const fs = require("fs");

    if (!fs.existsSync("./tsconfig.json")) {
        return {
            compilerOptions: {}
        };
    }

    return JSON.parse(fs.readFileSync("./tsconfig.json", "utf8"));
}

/**
 * The the globs for the typescript files.
 * @param {ITsConfig} tsconfig
 * @returns {Array.<string>} The globs for the typescript files.
 */
function toGlobs(tsconfig) {
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

    return globs;
}

gulp.task("compile:typescripts", () => {
    const tsc = require("./components/tsc");
    const ts = require("typescript");
    const tsconfig = loadTsConfigJson();
    const compilerOptionsParseResult = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, undefined);

    if (compilerOptionsParseResult.errors && compilerOptionsParseResult.errors.length > 0) {
        compilerOptionsParseResult.errors.forEach((error) => log.error(`[${error.category}]`, error.messageText));
        throw new Error("Failed to parse tsconfig.json:compilerOptions.");
    }

    return gulp
        .src(toGlobs(tsconfig))
        .pipe(tsc.compile(compilerOptionsParseResult.options))
        .pipe(gulp.dest("build"));
});

gulp.task("copy-files",
    () => gulp
        .src([
            "**/*",
            "!**/*.ts",
            "**/*.d.ts",

            "!publish/**/*",
            "!node_modules/**/*",
            "!build/**/*",

            "!build",
            "!publish",
            "!node_modules"])
        .pipe(new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                console.log(chunk.isDirectory() ? "dir" : "file", chunk.path);
                this.push(chunk);
                callback();
            }
        }))
        .pipe(gulp.dest("build", { overwrite: true })));

gulp.task("build", gulp.series("compile:typescripts", "copy-files"));



gulp.task("clean", () => del(["build/", "publish/"]));

gulp.task("clean-build", gulp.series("clean", "build"));


