//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");

const configs = require("../configs");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

gulp.task("npm@install", async () => {
    const nodeModulesDir = path.join(configs.buildInfos.paths.buildDir, "node_modules");

    if (fs.existsSync(nodeModulesDir)) {
        const stat = fs.statSync(nodeModulesDir);

        if (stat.isDirectory()) {
            return;
        }

        throw new Error(`A file with name "node_modules" exists under: ${configs.buildInfos.paths.buildDir}`);
    }

    const npmcmd = `npm install --production`;

    console.log("NPM", "Executing", `${configs.buildInfos.paths.buildDir}> ${npmcmd}`);
    console.log(execSync(npmcmd, { cwd: configs.buildInfos.paths.buildDir, encoding: "utf8" }));
});