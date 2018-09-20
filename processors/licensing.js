//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const { Transform } = require("stream");
const VinylFile = require("vinyl");
const fs = require("fs");
const path = require("path");
const glob = require("fast-glob");

const utils = require("../utilities");

/**
 * @typedef IDepLicenseInfo
 * @property {string} name
 * @property {string} licensePath
 * @property {string} homepage
 */

/**
 * 
 * @param {*} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson
 * @returns {NodeJS.ReadWriteStream}
 */
function constructProcessor(config, buildTarget, buildInfos, packageJson) {
    /** @type {IDictionary.<IDepLicenseInfo>} */
    const depLicenses = Object.create(null);

    return new Transform({
        objectMode: true,

        flush(callback) {
            const noticeFileName = path.join(buildInfos.paths.intermediateDir, "ThirdPartyNotice.txt");
            const fd = fs.openSync(noticeFileName, "w+");

            try {
                // Write headers.
                fs.writeSync(fd, "THIRD-PARTY SOFTWARE NOTICES AND INFORMATION\r\n");
                fs.writeSync(fd, "Do Not Translate or Localize\r\n");
                fs.writeSync(fd, "\r\n");
                fs.writeSync(fd, `${buildInfos.productName} incorporates components from the projects listed below. `);
                fs.writeSync(fd, `The original copyright notices and the licenses under which ${packageJson.author} received such components are set forth below. `);
                fs.writeSync(fd, `${packageJson.author} reserves all rights not expressly granted herein, whether by implication, estoppel or otherwise.\r\n`);
                fs.writeSync(fd, "\r\n");

                const depLicenseInfos = Object.values(depLicenses);

                // Write Index.
                for (let depIndex = 0; depIndex < depLicenseInfos.length; depIndex++) {
                    const info = depLicenseInfos[depIndex];

                    fs.writeSync(fd, `${depIndex + 1}.\t${info.name} (${info.homepage})\r\n`);
                }

                // Write license.
                for (let depIndex = 0; depIndex < depLicenseInfos.length; depIndex++) {
                    const info = depLicenseInfos[depIndex];

                    fs.writeSync(fd, "\r\n");
                    fs.writeSync(fd, `${info.name} NOTICES AND INFORMATION BEGIN HERE\r\n`);
                    fs.writeSync(fd, "=========================================\r\n");
                    fs.writeSync(fd, fs.readFileSync(info.licensePath, "utf8"));
                    fs.writeSync(fd, "\r\n");
                    fs.writeSync(fd, "=========================================\r\n");
                    fs.writeSync(fd, `END OF ${info.name} NOTICES AND INFORMATION\r\n`);
                }
            } finally {
                if (fd > 0) {
                    fs.closeSync(fd);
                }
            }

            this.push(new VinylFile({
                base: buildInfos.paths.intermediateDir,
                path: noticeFileName,
                contents: fs.createReadStream(noticeFileName)
            }));

            callback();
        },

        /**
         * 
         * @param {import("vinyl")} chunk
         */
        transform(chunk, encoding, callback) {
            const stat = fs.statSync(chunk.path);
            if (!stat.isFile()) {
                callback(new Error(`Cannot handle non-file package: ${chunk.path}`));
                return;
            }

            /** @type {IPackageConfig} */
            const packageJson = JSON.parse(fs.readFileSync(chunk.path, "utf8"));

            /** @type {IDictionary.<string>} */
            const dependencies = Object.create(null);

            if (!utils.object.isNullUndefinedOrEmpty(packageJson.dependencies)) {
                Object.assign(dependencies, packageJson.dependencies);
            }

            if (!utils.object.isNullUndefinedOrEmpty(packageJson.bundleDependencies)) {
                Object.assign(dependencies, packageJson.bundleDependencies);
            }

            if (utils.object.isEmpty(dependencies)) {
                callback();
                return;
            }

            /** @type {string} */
            let nodeModulesDir = path.dirname(chunk.path);

            while (!fs.existsSync(path.join(nodeModulesDir, "node_modules"))) {
                if (nodeModulesDir === path.dirname(nodeModulesDir)) {
                    callback(new Error(`Cannot find "node_modules" folder for package.json: ${chunk.path}`));
                    return;
                }

                nodeModulesDir = path.dirname(nodeModulesDir);
            }

            nodeModulesDir = path.join(nodeModulesDir, "node_modules");

            for (const depName in dependencies) {
                if (depName in depLicenses) {
                    continue;
                }

                /** @type {Array.<string>} */
                const licenseFiles = glob.sync(
                    [
                        path.join(nodeModulesDir, depName, "LICENSE"),
                        path.join(nodeModulesDir, depName, "LICENSE.*"),
                        path.join(nodeModulesDir, depName, "README"),
                        path.join(nodeModulesDir, depName, "README.*")
                    ],
                    { case: false, nocase: true, dot: true });

                if (!licenseFiles || licenseFiles.length <= 0) {
                    callback(new Error(`Failed to acquire license file for "${depName}"`));
                    return;
                }

                /** @type {IPackageConfig} */
                const depPackageJson = JSON.parse(fs.readFileSync(path.join(nodeModulesDir, depName, "package.json"), "utf8"));

                depLicenses[depName] = {
                    name: depName,
                    licensePath: licenseFiles[0],
                    homepage: depPackageJson.homepage
                };
            }

            callback();
        }
    });
};
module.exports = constructProcessor;
