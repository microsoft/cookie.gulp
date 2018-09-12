//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import * as path from "path";
import * as semver from "semver";

import * as log from "../../log";
import * as globUtils from "../../glob-utils";
import * as configs from "../../configs";
import * as msi from "../../components/msi/msi";

const VarName_MsiVersion = "MSIVERSION";
const MsiTaskName = "publish@msi";

function generateMsiVersion(): string {
    if (!semver.valid(configs.buildInfos.buildNumber)) {
        throw new Error("Invalid build number (not semver format).");
    }

    const version = new semver.SemVer(configs.buildInfos.buildNumber);

    return `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
}

function generateMsiTask(arch: "x86" | "x64" | "ia64", options: IMsiTaskConfig): string {
    const taskName = `${MsiTaskName}:${arch}`;

    gulp.task(taskName,
        () => gulp
            .src(path.join(configs.buildInfos.paths.buildDir, "**/*"), { dot: true })
            .pipe(msi.heat({
                intermediateDir: configs.buildInfos.paths.intermediateDir,
                autoGenerateComponentGuids: options.autoGenerateComponentGuids,
                generateGuidsNow: options.generateGuidsNow,
                keepEmptyFolders: options.keepEmptyFolders,
                rootDirectory: options.rootDirectory,
                componentGroupName: options.componentGroupName,
                xsltTemplatePath: options.xsltTemplatePath
            }))
            .pipe(gulp.src(globUtils.formGlobs(...(options.wxsGlobs || ["**/*.wxs"])), { dot: true }))
            .pipe(msi.candle({
                intermediateDir: configs.buildInfos.paths.intermediateDir,
                arch: arch,
                variables: options.variables
            }))
            .pipe(msi.light({
                intermediateDir: configs.buildInfos.paths.intermediateDir,
                spdb: options.spdb,
                outFileName: `setup-${options.variables[VarName_MsiVersion]}.${arch}.msi`
            }))
            .pipe(gulp.dest(path.join(configs.buildInfos.paths.publishDir, "msi", arch))));

    return taskName;
}

gulp.task(MsiTaskName, () => {
    if (process.platform !== "win32") {
        log.warning("MSI", "Target", "Skipping: Publishing MSI must be on Windows platform.");
    }

    const options: IMsiTaskConfig = configs.buildInfos.taskConfigs["publish@msi"] || Object.create(null);

    options.variables = options.variables || Object.create(null);

    if (!options.variables[VarName_MsiVersion]) {
        options.variables[VarName_MsiVersion] = generateMsiVersion();
        log.info("MSI", "Variable", `${VarName_MsiVersion}="${options.variables[VarName_MsiVersion]}"`);
    }

    const tasks: Array<string> = [];

    if (configs.buildInfos.targets.win32
        && Array.isArray(configs.buildInfos.targets.win32.archs)) {
        for (const arch of configs.buildInfos.targets.win32.archs) {
            switch (arch) {
                case "x32":
                    tasks.push(generateMsiTask("x86", options));
                    break;

                case "x64":
                    tasks.push(generateMsiTask("x64", options));
                    break;

                default:
                    log.warning("MSI", "Target", `Skipping: Unsupported architecture: ${arch}`);
                    break;
            }
        }
    }

    if (tasks.length <= 0) {
        log.info("MSI", "Target", `Skipping: Build target, win32, is not configured or no architecture is configured correctly.`);
        return Promise.resolve();
    }

    return gulp.series(tasks);
});
