//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

"use strict";

const gulp = require("gulp");
const del = require("del");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");

gulp.task("build",
    () => gulp
        .src([
            "**/*",

            "!**/gulpfile.js",
            "!**/package-lock.json",
            "!publish/**/*",
            "!node_modules/**/*",
            "!build/**/*",

            "!build",
            "!publish",
            "!node_modules"])
        .pipe(gulp.dest("build", { overwrite: true })));

gulp.task("pack:npm", () => {
    try {
        const publishStats = fs.statSync("./publish");

        if (!publishStats.isDirectory()) {
            fs.mkdirSync("./publish");
        }
    } catch (err) {
        if (err && err.code === "ENOENT") {
            fs.mkdirSync("./publish");
        } else {
            throw err;
        }
    }

    try {
        const npmPackCmd = `npm pack "${path.resolve("./build")}"`;

        console.log("Executing:", npmPackCmd);
        const output = cp.execSync(npmPackCmd, { cwd: path.resolve("./publish"), encoding: "utf8" });

        console.log("Info", output);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
});

gulp.task("clean", () => del(["build/", "publish/"]));

gulp.task("clean-build", gulp.series("clean", "build"));

gulp.task("publish", gulp.series("clean-build", "pack:npm"));
