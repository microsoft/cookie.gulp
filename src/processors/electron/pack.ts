//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Transform } from "stream";
import * as fs from "fs";
import * as path from "path";
import * as tmp from "tmp";
import * as VinylFile from "vinyl";
import * as packager from "electron-packager";
import * as glob from "fast-glob";

import * as globUtils from "../../glob-utils";

function toPackagerArch(arch: NodeJS.Architecture): packager.arch {
    switch (arch) {
        case "x32":
            return "ia32";

        case "x64":
            return "x64";

        case "arm64":
            return "arm64";

        default:
            throw new Error(`unsupported architecture: ${arch}`);
    }
}

function toPackagerPlatform(platform: NodeJS.Platform): packager.platform {
    switch (platform) {
        case "linux":
            return "linux";

        case "win32":
            return "win32";

        case "darwin":
            return "darwin";

        default:
            throw "unsupported platform: " + platform;
    }
}

export = constructProcessor;
const constructProcessor: ProcessorConstructor =
    (config: IElectronPackageProcessorConfig, buildTarget, buildInfos, packageJson): NodeJS.ReadableStream & NodeJS.WritableStream => {
        const tempDir = tmp.dirSync({ dir: buildInfos.paths.intermediateDir, unsafeCleanup: true }).name;

        return new Transform({
            objectMode: true,

            flush(callback) {
                config = config || Object.create(null);
                config.macOS = config.macOS || Object.create(null);

                let iconDir: string = undefined;

                if (config.icons) {
                    iconDir = tmp.dirSync({ dir: buildInfos.paths.intermediateDir, unsafeCleanup: true }).name;

                    glob.sync(globUtils.toGlobs(config.icons), { dot: true })
                        .forEach((iconPath: string) => fs.copyFileSync(iconPath, path.join(iconDir, path.basename(iconPath))));
                }

                const options: packager.Options = {
                    overwrite: true,
                    platform: toPackagerPlatform(buildTarget.platform),
                    arch: toPackagerArch(buildTarget.arch),
                    out: buildInfos.paths.intermediateDir,
                    tmpdir: buildInfos.paths.intermediateDir,
                    dir: tempDir,

                    // Configurable
                    asar: config.asar,
                    icon: iconDir,
                    appCopyright: buildInfos.copyright,
                    appVersion: buildInfos.buildNumber,
                    executableName: buildInfos.executableName,
                    name: buildInfos.productName,

                    // macOS
                    appBundleId: config.macOS.appBundleId,
                    appCategoryType: config.macOS.appCategoryType,
                    helperBundleId: config.macOS.helperBundleId,

                    // Windows
                    win32metadata: {
                        CompanyName: packageJson.author,
                        ProductName: buildInfos.productName,
                        OriginalFilename: buildInfos.executableName,
                        FileDescription: packageJson.description,
                        InternalName: packageJson.name
                    }
                };

                packager(options).then(
                    (packagePaths: Array<string>) => {
                        for (const packagePath of packagePaths) {
                            this.push(new VinylFile({ path: path.resolve(packagePath) }));
                        }

                        callback();
                    },

                    (reason) => callback(reason));
            },

            transform(chunk: VinylFile, encoding, callback): void {
                fs.copyFileSync(chunk.path, path.join(tempDir, chunk.relative));
                callback();
            }
        });
    };
