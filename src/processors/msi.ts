//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import * as path from "path";
import * as semver from "semver";

import * as log from "../log";
import * as globUtils from "../glob-utils";
import * as wix from "../components/wix/wix";

const VarName_MsiVersion = "MSIVERSION";

function generateMsiVersion(): string {
    if (!semver.valid(configs.buildInfos.buildNumber)) {
        throw new Error("Invalid build number (not semver format).");
    }

    const version = new semver.SemVer(configs.buildInfos.buildNumber);

    return `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
}

function createProcessor(arch: "x86" | "x64" | "ia64", options: IMsiTaskConfig): string {
            .pipe(wix.heat({
        intermediateDir: configs.buildInfos.paths.intermediateDir,
        autoGenerateComponentGuids: options.autoGenerateComponentGuids,
        generateGuidsNow: options.generateGuidsNow,
        keepEmptyFolders: options.keepEmptyFolders,
        rootDirectory: options.rootDirectory,
        componentGroupName: options.componentGroupName,
        xsltTemplatePath: options.xsltTemplatePath
    }))
        .pipe(gulp.src(globUtils.formGlobs(...(options.wxsGlobs || ["**/*.wxs"])), { dot: true }))
        .pipe(wix.candle({
            intermediateDir: configs.buildInfos.paths.intermediateDir,
            arch: arch,
            variables: options.variables
        }))
        .pipe(wix.light({
            intermediateDir: configs.buildInfos.paths.intermediateDir,
            spdb: options.spdb,
            outFileName: `setup-${options.variables[VarName_MsiVersion]}.${arch}.msi`
        }))
}

const msi: ProcessorConstructor =
    (config: IMsiProcessorConfig, buildTarget, buildInfos) => {
        if (process.platform !== "win32") {
            log.warning("MSI", "Target", "Skipping: Publishing MSI must be on Windows platform.");
        }

        config.variables = config.variables || Object.create(null);

        if (!config.variables[VarName_MsiVersion]) {
            config.variables[VarName_MsiVersion] = generateMsiVersion();
            log.info("MSI", "Variable", `${VarName_MsiVersion}="${config.variables[VarName_MsiVersion]}"`);
        }

        const tasks: Array<string> = [];

        if (config.buildInfos.targets.win32
            && Array.isArray(config.buildInfos.targets.win32.archs)) {
            for (const arch of config.buildInfos.targets.win32.archs) {
                switch (arch) {
                    case "x32":
                        tasks.push(generateMsiTask("x86", config));
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
    };

export = msi;
