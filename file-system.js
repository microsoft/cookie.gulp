//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

exports.rmdirAsync = promisify(fs.rmdir);
exports.readDirAsync = promisify(fs.readdir);
exports.statAsync = promisify(fs.stat);
exports.unlinkAsync = promisify(fs.unlink);
exports.existsAsync = promisify(fs.exists);

/**
 * 
 * @param {string} targetPath 
 * @returns {Promise<void>}
 */
function deleteAsync(targetPath) {
    return exports.statAsync(targetPath)
        .then(
            (stat) => {
                if (stat.isFile || stat.isSymbolicLink) {
                    return exports.unlinkAsync(targetPath);
                }
                else if (stat.isDirectory()) {
                    return exports.readDirAsync(targetPath)
                        .then((items) => Promise.all(items.map((item) => deleteAsync(path.join(targetPath, item)))));
                }
                else {
                    return Promise.reject(`Not supported targetPath: ${targetPath}`);
                }
            },
            (reason) => {
                if (reason && reason.code && reason.code === "ENOENT") {
                    return Promise.resolve();
                }

                return Promise.reject(reason);
            });
}
exports.deleteAsync = deleteAsync;
