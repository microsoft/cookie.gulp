//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

/**
 * 
 * @param {ICandleOptions} [options]
 * @returns {NodeJS.ReadWriteStream}
 */
function candle(options) {
    const { Transform } = require("stream");
    const path = require("path");
    const tmp = require("tmp");
    const { exec } = require("child_process");
    const fs = require("fs");
    const vinyl = require("cookie.gulp/vinyl");

    options = options || Object.create(null);
    options.intermediateDir = options.intermediateDir || tmp.dirSync({ unsafeCleanup: true }).name;

    options.variables = options.variables || Object.create(null);
    options.arch = options.arch || "x86";

    /** @type {Array.<import("vinyl")>} */
    const sourceFiles = [];

    return new Transform({
        objectMode: true,

        flush(callback) {
            const wxsobjDir = tmp.dirSync({ dir: options.intermediateDir }).name;
            const exeCandle = path.join(__dirname, "./wix/candle.exe");
            const argSourceFiles = sourceFiles.map((file) => `"${file.path}"`).join(" ");
            const argVariables = Object.keys(options.variables).map((varName) => `-d${varName}="${options.variables[varName]}"`).join(" ");
            const cmdCandle = `"${exeCandle}" -arch ${options.arch} ${argVariables} -out "${wxsobjDir}\\\\" ${argSourceFiles}`;

            console.info("MSI", "Executing", cmdCandle);

            exec(cmdCandle, { encoding: "utf8" },
                (err, stdout, stderr) => {
                    console.info(stdout);

                    if (stderr) {
                        console.error(stderr);
                    }

                    if (!err) {
                        fs.readdirSync(wxsobjDir, "utf8")
                            .forEach((fileName) => {
                                const filePath = path.join(wxsobjDir, fileName);

                                this.push(vinyl(filePath, wxsobjDir));
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
            if (!chunk.isDirectory()) {
                sourceFiles.push(chunk);
            } else {
                this.push(chunk);
            }

            callback();
        }
    });
}
module.exports = candle;
