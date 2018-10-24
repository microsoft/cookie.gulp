//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/**
 * 
 * @param {ILightOptions} [options]
 * @returns {NodeJS.ReadWriteStream}
 */
function light(options) {
    const { Transform } = require("stream");
    const path = require("path");
    const tmp = require("tmp");
    const utils = require("cookie.gulp/utils");
    const { exec } = require("child_process");
    const fs = require("fs");
    const { vinyl } = require("cookie.gulp/file-system");
    
    options = options || Object.create(null);
    options.intermediateDir = options.intermediateDir || tmp.dirSync({ unsafeCleanup: true }).name;

    options.spdb = options.spdb === true;
    options.outFileName = utils.string.isNullUndefinedOrWhitespaces(options.outFileName) ? "setup.msi" : options.outFileName;

    /** @type {string} */
    let packDir;

    /** @type {Array.<string>} */
    const wxsObjs = [];

    return new Transform({
        objectMode: true,

        flush(callback) {
            const exeLight = path.join(__dirname, "./wix/light.exe");
            const argSpdb = options.spdb ? "-spdb" : "";
            const outDir = tmp.dirSync({ dir: options.intermediateDir, unsafeCleanup: true }).name;
            const argOut = path.join(outDir, options.outFileName);
            const argWxsObjs = wxsObjs.map((fileName) => `"${fileName}"`).join(" ");
            const cmdLight = `"${exeLight}" -b ${packDir} ${argSpdb} -out ${argOut} ${argWxsObjs}`;

            console.info("MSI", "Executing", cmdLight);
            exec(cmdLight, { encoding: "utf8" },
                (err, stdout, stderr) => {
                    console.info(stdout);

                    if (stderr) {
                        console.error(stderr);
                    }

                    if (!err) {
                        fs.readdirSync(outDir, "utf8")
                            .forEach((fileName) => {
                                const filePath = path.join(outDir, fileName);

                                this.push(vinyl(filePath, outDir));
                            });
                    }

                    callback(err);
                });
        },

        /**
         * 
         * @param {import("vinyl")} chunk
         */
        transform(chunk, encoding, callback) {
            if (chunk.isDirectory()) {
                packDir = chunk.path;
            } else {
                wxsObjs.push(chunk.path);
            }

            callback();
        }
    });
}
module.exports = light;
