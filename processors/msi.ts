//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import { PassThrough } from "stream";
import * as semver from "semver";

import * as log from "../log";
import * as globUtils from "../glob-utils";
import * as wix from "../components/wix/wix";
import { chain } from "../steams-utils";

type MsiArch = "x86" | "x64" | "ia64";

const VarName_MsiVersion = "MSIVERSION";

function generateMsiVersion(buildInfos: IBuildInfos): string {
    if (!semver.valid(buildInfos.buildNumber)) {
        throw new Error("Invalid build number (not semver format).");
    }

    const version = new semver.SemVer(buildInfos.buildNumber);

    return `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version)}`;
}

export = msi;
const msi: ProcessorConstructor =
    (config: IMsiProcessorConfig, buildTarget, buildInfos, packageJson) => {
        if (process.platform !== "win32") {
            log.warning("MSI", "Target", "Skipping: Publishing MSI must be on win32.");
            return new PassThrough();
        }

        if (buildTarget.platform !== "win32") {
            log.error("MSI", "Target", "Skipping: BuildTarget.platform must be win32.");
            return new PassThrough();
        }

        if (buildTarget.arch !== "x32"
            && buildTarget.arch !== "x64") {
            log.error("MSI", "Target", "Skpping: BuildTarget.arch must be x32 or x64.");
        }

        config.variables = config.variables || Object.create(null);

        if (!config.variables[VarName_MsiVersion]) {
            config.variables[VarName_MsiVersion] = generateMsiVersion(buildInfos);
            log.info("MSI", "Variable", `${VarName_MsiVersion}="${config.variables[VarName_MsiVersion]}"`);
        }

        return chain(
            wix.heat({
                intermediateDir: buildInfos.paths.intermediateDir,
                autoGenerateComponentGuids: config.autoGenerateComponentGuids,
                generateGuidsNow: config.generateGuidsNow,
                keepEmptyFolders: config.keepEmptyFolders,
                rootDirectory: config.rootDirectory,
                componentGroupName: config.componentGroupName,
                xsltTemplatePath: config.xsltTemplatePath
            }),
            gulp.src(config.wxsPath ? globUtils.toGlobs(config.wxsPath, "wxs") : "**/*.wxs", { dot: true }),
            wix.candle({
                intermediateDir: buildInfos.paths.intermediateDir,
                arch: <MsiArch>buildTarget.arch,
                variables: config.variables
            }),
            wix.light({
                intermediateDir: buildInfos.paths.intermediateDir,
                spdb: config.spdb,
                outFileName: `setup-${config.variables[VarName_MsiVersion]}.${buildTarget.arch}.msi`
            }));
    };
