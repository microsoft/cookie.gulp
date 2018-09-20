//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const VinylFile = require("vinyl");

const utils = require("./utilities");

exports.rmdirAsync = promisify(fs.rmdir);
exports.readDirAsync = promisify(fs.readdir);
exports.statAsync = promisify(fs.stat);
exports.unlinkAsync = promisify(fs.unlink);
exports.existsAsync = promisify(fs.exists);

/**
 * @param {string} dir
 */
function createDirectory(dir) {
    if (utils.string.isNullUndefinedOrWhitespaces(dir)) {
        throw new Error("dir must be provided (not null/undefined/whitespaces).");
    }

    dir = path.relative(path.resolve("."), dir);

    const parts = dir.includes("/") ? dir.split("/") : dir.split("\\");
    let currentDir = "";

    for (const part of parts) {
        currentDir = path.join(currentDir, part);

        let stat;

        try {
            stat = fs.statSync(currentDir);
        } catch (err) {
            if (!err || (err && err.code !== "ENOENT")) {
                throw err;
            }

            stat = null;
        }

        if (!stat || !stat.isDirectory()) {
            fs.mkdirSync(currentDir);
        }
    }
}
exports.createDirectory = createDirectory;

/**
 * 
 * @param {string} targetPath 
 * @returns {Promise<void>}
 */
function deleteAsync(targetPath) {
    return exports.statAsync(targetPath)
        .then(
            // @ts-ignore
            (stat) => {
                if (stat.isFile() || stat.isSymbolicLink()) {
                    return exports.unlinkAsync(targetPath)
                        .catch((err) => err && err.code === "ENOENT" ? Promise.resolve() : Promise.reject(err));
                }
                else if (stat.isDirectory()) {
                    return exports.readDirAsync(targetPath)
                        .then((items) => Promise.all(items.map((item) => deleteAsync(path.join(targetPath, item)))))
                        .then(() => exports.rmdirAsync(targetPath))
                        .catch((err) => err && err.code === "ENOENT" ? Promise.resolve() : Promise.reject(err));
                }
                else {
                    return Promise.reject(`Not supported targetPath: ${targetPath}`);
                }
            },

            /** @param {*} reason */
            (reason) => {
                if (reason && reason.code && reason.code === "ENOENT") {
                    return Promise.resolve();
                }

                return Promise.reject(reason);
            });
}
exports.deleteAsync = deleteAsync;

/**
 * Create a Vinyl File object.
 * @param {string} filePath,
 * @param {string} [base]
 * @returns {import("vinyl")}
 */
function vinyl(filePath, base) {
    const stat = fs.statSync(filePath);

    return new VinylFile({
        path: filePath,
        base: base,
        stat: stat,
        contents: stat.isFile() ? fs.createReadStream(filePath) : undefined
    });
}
exports.vinyl = vinyl;
