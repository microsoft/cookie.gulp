//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { Transform, PassThrough } = require("stream");
const VinylFile = require("vinyl");
const tmp = require("tmp");
const glob = require("fast-glob");
const path = require("path");

const log = require("../../log");
const globUtils = require("../../glob-utils");
const dd = require("../../dynamic-dependency");

/** @type {string} */
const InstallerDepName = "electron-installer-redhat";

/** @type {string} */
const ModuleName = "RPM";

/**
 * Convert NodeJS.Architecture to installer specific architecture.
 * @param {NodeJS.Architecture} arch 
 * @returns {string}
 */
function toInstallerArch(arch) {
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

/**
 * 
 * @param {GlobLike} icons 
 */
function generateIconOptions(icons) {
    /** @type {Array.<string>} */
    const iconFiles = glob.sync(globUtils.toGlobs(icons, "png"), { dot: true });

    if (!iconFiles || iconFiles.length <= 0) {
        return undefined;
    }

    /** @type {IDictionary.<string>} */
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

/**
 * 
 * @param {IElectronLinuxInstallerProcessorConfig} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function constructProcessor(config, buildTarget, buildInfos, packageJson) {
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

        /** @param {import("vinyl")} chunk */
        transform(chunk, encoding, callback) {
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
                        .forEach(
                            /** @param {string} fileName */
                            (fileName) => this.push(new VinylFile({ path: fileName, base: options.dest })));

                    callback();
                },
                /** @param {*} reason */
                (reason) => callback(reason));
        }
    });
};
module.exports = constructProcessor;

// Initialization
(() => {
    if (!dd.isModuleInstalled(InstallerDepName)) {
        log.info(ModuleName, "Dependency", `Installing dependency "${InstallerDepName}" ...`);
        dd.installDynamicDependency(
            InstallerDepName,
            {
                depTypes: ["dev"]
            });
    }
})();
