//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Transform, PassThrough } from "stream";
import * as VinylFile from "vinyl";
import * as tmp from "tmp";
import * as path from "path";

import * as log from "../../log";
import * as dd from "../../dynamic-dependency";

const InstallerDepName = "electron-installer-zip";
const ModuleName = "ZIP";

export = constructProcessor;
const constructProcessor: ProcessorConstructor =
    (config, buildTarget, buildInfos, packageJson): NodeJS.ReadableStream & NodeJS.WritableStream => {
        if (process.platform !== "darwin") {
            log.warning(ModuleName, "Target", "Skipping: Publishing ZIP must be on darwin.");
            return new PassThrough();
        }

        if (buildTarget.platform !== "darwin") {
            log.error(ModuleName, "Target", "Skipping: BuildTarget.platform must be darwin.");
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
                    dir: path.join(chunk.path, `${buildInfos.productName}.app`),
                    out: tmp.dirSync({ dir: buildInfos.paths.intermediateDir, unsafeCleanup: true }).name
                };

                const installer = require(InstallerDepName);

                installer(options, (err, outfile) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    this.push(new VinylFile({ path: outfile }));
                    callback();
                });
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
