//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Transform, PassThrough } from "stream";
import * as VinylFile from "vinyl";
import * as tmp from "tmp";
import * as glob from "fast-glob";
import * as path from "path";

import * as log from "../../log";
import * as globUtils from "../../glob-utils";
import * as dd from "../../dynamic-dependency";

const InstallerDepName = "electron-installer-redhat";
const ModuleName = "RPM";

function toInstallerArch(arch: NodeJS.Architecture): string {
    if (!arch) {
        return "i386";
    }

    switch (arch) {
        case "x32":
            return "i386";

        case "x64":
            return "amd64";

        default:
            throw new Error(`unsupported architecture: ${arch}`);
    }
}

function generateIconOptions(iconPath: IPath): any {
    const iconFiles: Array<string> = glob.sync(globUtils.toGlobs(iconPath, "png"), { dot: true });

    if (!iconFiles || iconFiles.length <= 0) {
        return undefined;
    }

    const iconObj = {};

    for (const iconFileName of iconFiles) {
        if (path.basename(iconFileName) === "scalable.svg") {
            iconObj["scalable"] = iconFileName;
        } else if (path.extname(iconFileName) === ".png") {
            const size = iconFileName.match(/(\d+)/g)[0];

            if (size) {
                iconObj[`${size}x${size}`] = iconFileName;
            }
        }
    }

    return iconObj;
}

export = constructProcessor;
const constructProcessor: ProcessorConstructor =
    (config: IElectronLinuxInstallerProcessorConfig, buildTarget, buildInfos, packageJson): NodeJS.ReadableStream & NodeJS.WritableStream => {
        if (process.platform !== "linux") {
            log.warning(ModuleName, "Target", "Skipping: Publishing RPM must be on linux.");
            return new PassThrough();
        }

        if (buildTarget.platform !== "linux") {
            log.error(ModuleName, "Target", "Skipping: BuildTarget.platform must be linux.");
            return new PassThrough();
        }

        return new Transform({
            objectMode: true,

            transform(chunk: VinylFile, encoding, callback): void {
                if (!chunk.isDirectory()) {
                    this.push(chunk);
                    callback();
                    return;
                }

                const options = {
                    src: chunk.path,
                    dest: tmp.dirSync({ dir: buildInfos.paths.intermediateDir, unsafeCleanup: true }).name,
                    arch: toInstallerArch(buildTarget.arch),
                    name: buildInfos.executableName,
                    productName: buildInfos.productName,
                    genericName: buildInfos.productName,
                    version: buildInfos.buildNumber,
                    revision: 0,
                    section: config.section,
                    bin: buildInfos.executableName,
                    icon: generateIconOptions(config.icons),
                    categories: config.categories
                };

                const installer = require(InstallerDepName);

                installer(options).then(
                    () => {
                        glob.sync("**/*", { cwd: options.dest })
                            .forEach((fileName: string) => this.push(new VinylFile({ path: fileName, base: options.dest })));
                        callback();
                    },
                    (reason) => callback(reason));
            }
        });
    };

// Initialization
(() => {
    if (!dd.isModuleInstalled(InstallerDepName)) {
        log.info(ModuleName, "Dependency", `Installing dependency "${InstallerDepName}" ...`);
        dd.installDynamicDependency(InstallerDepName, {
            depTypes: ["dev"]
        });
    }
})();
