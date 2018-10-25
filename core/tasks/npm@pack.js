//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");
const fs = require("fs");
const path = require("path");

const configs = require("../configs");
const { execSync } = require("child_process");

gulp.task("npm@pack", async () => {
    const npmcmd = `npm pack`;

    console.log("NPM", "Executing", `${configs.buildInfos.paths.buildDir}> ${npmcmd}`);
    console.log(execSync(npmcmd, { cwd: configs.buildInfos.paths.buildDir, encoding: "utf8" }));

    const tgzName = `${configs.packageJson.name}-${configs.buildInfos.buildNumber}.tgz`;

    fs.copyFileSync(
        path.join(configs.buildInfos.paths.buildDir, tgzName),
        path.join(configs.buildInfos.paths.publishDir, tgzName));
    fs.unlinkSync(path.join(configs.buildInfos.paths.buildDir, tgzName));
});