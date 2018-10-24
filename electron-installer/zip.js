//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const { Transform, PassThrough } = require("stream");
const tmp = require("tmp");
const path = require("path");
const glob = require("fast-glob");

const log = require("cookie.gulp/log");
const dd = require("cookie.gulp/dynamic-dependency");
const { vinyl } = require("cookie.gulp/file-system");

/** @type {string} */
const InstallerDepName = "electron-installer-zip";

/** @type {string} */
const ModuleName = "ZIP";

/**
 * 
 * @param {*} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function constructProcessor(config, buildTarget, buildInfos, packageJson) {
    if (process.platform !== "darwin") {
        log.warning(ModuleName, "Target", "Skipping: Publishing ZIP must be on darwin.");
        return new PassThrough({ objectMode: true });
    }

    if (buildTarget.platform !== "darwin") {
        log.error(ModuleName, "Target", "Skipping: BuildTarget.platform must be darwin.");
        return new PassThrough({ objectMode: true });
    }

    if (!dd.isModuleInstalled(InstallerDepName)) {
        log.info(ModuleName, "Dependency", `Installing dependency "${InstallerDepName}" ...`);
        dd.installDynamicDependency(
            InstallerDepName,
            {
                depTypes: ["dev"]
            });
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
                dir: path.join(chunk.path, `${buildInfos.productName}.app`),
                out: path.join(buildInfos.paths.intermediateDir, `${buildInfos.executableName}-${buildTarget.platform}-${buildTarget.arch}.zip`)
            };

            const installer = require(InstallerDepName);

            installer(options,
                /**
                 * @param {*} err
                 */
                (err) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    this.push(vinyl(options.out, buildInfos.paths.intermediateDir));
                    callback();
                });
        }
    });
};
module.exports = constructProcessor;
