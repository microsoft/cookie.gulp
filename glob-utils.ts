//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as glob from "fast-glob";
import * as path from "path";

import * as configs from "./configs";

export function normalizeGlobs(...globs: Array<string>): Array<string> {
    const gulpfiles: Array<string> = glob.sync("**/gulpfile.js");
    const outputGlobs: Array<string> = [];

    outputGlobs.push(...globs);
    outputGlobs.push(...gulpfiles.map(((fileName) => "!" + path.join(path.dirname(fileName), "**", "*"))));

    return outputGlobs;
}

export function toGlobs(pathObj: IPath, exts?: string | Array<string>): Array<string> {
    if (!pathObj) {
        throw new Error("pathObj must be provided");
    }

    const extensions: Array<string> = [];

    if (exts) {
        if (typeof exts === "string") {
            extensions.push(exts);
        } else if (Array.isArray(exts)) {
            extensions.push(...exts);
        } else {
            throw new Error("Unsupport value of param, exts");
        }
    }

    switch (pathObj.type) {
        case "globs":
            const configuredGlobs = (<IGlobsPath>pathObj).globs;

            return normalizeGlobs(...(Array.isArray(configuredGlobs) ? configuredGlobs : [configuredGlobs]));

        case "path-ref":
            let pathNames = (<IPathRef>pathObj).names;

            if (!Array.isArray(pathNames)) {
                pathNames = [pathNames];
            }

            const globs: Array<string> = [];

            for (const pathName of pathNames) {
                const pathValue = configs.buildInfos.paths[pathName];

                if (!pathValue) {
                    throw new Error(`Unknown path: ${pathName}. A path must be registered under buildInfos:paths`);
                }

                if (extensions.length > 0) {
                    for (const ext of extensions) {
                        globs.push(path.join(pathValue, "**", `*.${ext}`));
                    }
                } else {
                    globs.push(path.join(pathValue, "**", "*"));
                }
            }

            return normalizeGlobs(...globs);

        default:
            throw new Error(`Unsupported path type: ${pathObj.type}`);
    }
}
