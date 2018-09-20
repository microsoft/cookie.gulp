//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const { Transform } = require("stream");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const VinylFile = require("vinyl");
const packager = require("electron-packager");
const glob = require("fast-glob");

const globUtils = require("../../glob-utils");

/**
 * Convert NodeJS.Architecture to packager specific architecture.
 * @param {NodeJS.Architecture} arch 
 * @returns {import("electron-packager").arch}
 */
function toPackagerArch(arch) {
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

/**
 * Convert NodeJS.Platform to packager specific architecture.
 * @param {NodeJS.Platform} platform 
 * @returns {import("electron-packager").platform}
 */
function toPackagerPlatform(platform) {
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

/**
 * 
 * @param {IElectronPackageProcessorConfig} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function constructProcessor(config, buildTarget, buildInfos, packageJson) {
    const tempDir = tmp.dirSync({ dir: buildInfos.paths.intermediateDir, unsafeCleanup: true }).name;

    return new Transform({
        objectMode: true,

        flush(callback) {
            config = config || Object.create(null);
            config.macOS = config.macOS || Object.create(null);

            /** @type {string} */
            let iconDir = undefined;

            if (config.icons) {
                iconDir = tmp.dirSync({ dir: buildInfos.paths.intermediateDir, unsafeCleanup: true }).name;

                glob.sync(globUtils.toGlobs(config.icons), { dot: true })
                    .forEach(
                        /** @param {string} iconPath */
                        (iconPath) => fs.copyFileSync(iconPath, path.join(iconDir, path.basename(iconPath))));
            }

            const options = {
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
                /** @param {Array.<string>} packagePaths */
                (packagePaths) => {
                    for (const packagePath of packagePaths) {
                        this.push(new VinylFile({ path: path.resolve(packagePath) }));
                    }
                    
                    callback();
                },
                (reason) => callback(reason));
        },

        /** @param {import("vinyl")} chunk */
        transform(chunk, encoding, callback) {
            fs.copyFileSync(chunk.path, path.join(tempDir, chunk.relative));
            callback();
        }
    });
};
module.exports = constructProcessor;
