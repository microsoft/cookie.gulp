//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/**
 * 
 * @param {IHeatOptions} [options]
 * @returns {NodeJS.ReadWriteStream}
 */
function heat(options) {
    const { Transform } = require("stream");
    const path = require("path");
    const tmp = require("tmp");
    const utils = require("donuts.node/utils");
    const { exec } = require("child_process");
    const fs = require("fs");
    const vinyl = require("cookie.gulp/vinyl");
    
    options = options || Object.create(null);
    options.intermediateDir = options.intermediateDir || tmp.dirSync({ unsafeCleanup: true }).name;

    if (utils.isNullOrUndefined(options.componentGroupName)) {
        options.componentGroupName = "MainComponentsGroup";
    }

    if (utils.isNullOrUndefined(options.rootDirectory)) {
        options.rootDirectory = "INSTALLFOLDER";
    }

    options.keepEmptyFolders = options.keepEmptyFolders === true;
    options.autoGenerateComponentGuids = options.autoGenerateComponentGuids === true;
    options.generateGuidsNow = options.generateGuidsNow === true;

    const tempDir = tmp.dirSync({ dir: options.intermediateDir, unsafeCleanup: true }).name;

    return new Transform({
        objectMode: true,

        flush(callback) {
            const filesWixPath = tmp.tmpNameSync({ dir: options.intermediateDir });
            const exeHeat = path.join(__dirname, "./wix/heat.exe");
            const argXslt = options.xsltTemplatePath ? `-t "${options.xsltTemplatePath}"` : "";
            const argKeepEmptyFolders = options.keepEmptyFolders ? "-ke" : "";
            const argDirectoryId = options.directoryId ? `-directoryid "${options.directoryId}"` : "";
            const argAgComponentGuid = options.autoGenerateComponentGuids ? "-ag" : "";
            const argAgGuidsNow = options.generateGuidsNow ? "-gg" : "";
            const cmdHeat = `"${exeHeat}" dir "${tempDir}" -srd -cg ${options.componentGroupName} -dr ${options.rootDirectory} ${argXslt} ${argKeepEmptyFolders} ${argDirectoryId} ${argAgComponentGuid} ${argAgGuidsNow} -o "${filesWixPath}"`;

            console.info("MSI", "Executing", cmdHeat);

            exec(cmdHeat, { encoding: "utf8" },
                (err, stdout, stderr) => {
                    console.info(stdout);

                    if (stderr) {
                        console.error(stderr);
                    }

                    if (!err) {
                        this.push(vinyl(filesWixPath));
                        this.push(vinyl(tempDir));
                    }

                    callback(err);
                });
        },

        /**
         * 
         * @param {import("vinyl")} chunk 
         */
        transform(chunk, encoding, callback) {
            try {
                if (chunk.isDirectory()) {
                    fs.mkdirSync(path.join(tempDir, chunk.relative));
                } else {
                    fs.copyFileSync(chunk.path, path.join(tempDir, chunk.relative));
                }

                callback();
            } catch (err) {
                callback(err);
            }
        }
    });
}
module.exports = heat;
