//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Transform } from "stream";
import * as VinylFile from "vinyl";
import * as fs from "fs";
import * as path from "path";
import * as glob from "fast-glob";
import * as tmp from "tmp";

import * as utils from "../utilities";

interface IDepLicenseInfo {
    name: string;
    licensePath: string;
    homepage: string;
}

export = constructProcessor;
const constructProcessor: ProcessorConstructor =
    (config, buildTarget, buildInfos, packageJson): NodeJS.ReadableStream & NodeJS.WritableStream => {
        const depLicenses: IDictionary<IDepLicenseInfo> = Object.create(null);

        return new Transform({
            objectMode: true,

            flush(callback) {
                const noticeFileObj = tmp.fileSync({ dir: buildInfos.paths.intermediateDir });
                const fd = noticeFileObj.fd;

                // Write headers.
                fs.writeSync(fd, "THIRD-PARTY SOFTWARE NOTICES AND INFORMATION\r\n");
                fs.writeSync(fd, "Do Not Translate or Localize\r\n");
                fs.writeSync(fd, "\r\n");
                fs.writeSync(fd, `${buildInfos.productName} incorporates components from the projects listed below.`);
                fs.writeSync(fd, `The original copyright notices and the licenses under which ${packageJson.author} received such components are set forth below.`);
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

                this.push(new VinylFile({ path: noticeFileObj.name }));
                callback();
            },

            transform(chunk: VinylFile, encoding, callback) {
                const stat = fs.statSync(chunk.path);

                if (!stat.isFile()) {
                    callback(new Error(`Cannot handle non-file package: ${chunk.path}`));
                    return;
                }

                const packageJson: IPackageConfig = JSON.parse(fs.readFileSync(chunk.path, "utf8"));
                const dependencies: IDictionary<string> = Object.create(null);

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

                let nodeModulesDir: string = path.dirname(chunk.path);

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

                    const licenseFiles: Array<string> =
                        glob.sync([
                            path.join(nodeModulesDir, depName, "LICENSE"),
                            path.join(nodeModulesDir, depName, "LICENSE.*")],
                            { case: false, nocase: true, dot: true });

                    if (!licenseFiles || licenseFiles.length <= 0) {
                        callback(new Error(`Failed to acquire license file for "${depName}"`));
                        return;
                    }

                    const depPackageJson: IPackageConfig = JSON.parse(fs.readFileSync(path.join(nodeModulesDir, depName, "package.json"), "utf8"));

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
