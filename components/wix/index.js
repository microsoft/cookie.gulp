//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const { Transform } = require("stream");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const { exec } = require("child_process");

const utils = require("../../utilities");
const { vinyl } = require("../../file-system");

/**
 * 
 * @param {IHeatOptions} [options]
 * @returns {NodeJS.ReadWriteStream}
 */
function heat(options) {
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
exports.heat = heat;

/**
 * 
 * @param {ICandleOptions} [options]
 * @returns {NodeJS.ReadWriteStream}
 */
function candle(options) {
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
exports.candle = candle;

/**
 * 
 * @param {ILightOptions} [options]
 * @returns {NodeJS.ReadWriteStream}
 */
function light(options) {
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
exports.light = light;
