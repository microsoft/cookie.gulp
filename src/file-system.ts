//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

export const rmdirAsync = promisify(fs.rmdir);
export const readDirAsync = promisify(fs.readdir);
export const statAsync = promisify(fs.stat);
export const unlinkAsync = promisify(fs.unlink);
export const existsAsync = promisify(fs.exists);

export function deleteAsync(targetPath: string): Promise<void> {
    return statAsync(targetPath)
        .then(
            (stat) => {
                if (stat.isFile || stat.isSymbolicLink) {
                    return unlinkAsync(targetPath);
                } else if (stat.isDirectory()) {
                    return readDirAsync(targetPath)
                        .then((items) => <Promise<any>>Promise.all(items.map((item) => deleteAsync(path.join(targetPath, item)))));
                } else {
                    return Promise.reject(`Not supported targetPath: ${targetPath}`);
                }
            },
            (reason: Error) => {
                if (reason && reason.code && reason.code === "ENOENT") {
                    return Promise.resolve();
                }

                return Promise.reject(reason);
            });
}
