//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");

const configs = require("../configs");
const { execSync } = require("child_process");

gulp.task("npm@version", async () => {
    const npmcmd = `npm version --allow-same-version ${configs.buildInfos.buildNumber}`;

    console.log("NPM", "Executing", `${configs.buildInfos.paths.buildDir}> ${npmcmd}`);
    console.log(execSync(npmcmd, { cwd: configs.buildInfos.paths.buildDir, encoding: "utf8" }));
});