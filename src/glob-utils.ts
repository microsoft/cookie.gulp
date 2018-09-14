//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as glob from "glob";
import * as path from "path";

import * as configs from "./configs";

export function formGlobs(...globs: Array<string>): Array<string> {
    const gulpfiles = glob.sync("**/gulpfile.js");
    const outputGlobs: Array<string> = [];

    outputGlobs.push(...globs);
    outputGlobs.push(...gulpfiles.map(((fileName) => "!" + path.join(path.dirname(fileName), "**", "*"))));

    return outputGlobs;
}

export function toGlobs(pathObj: IPath): Array<string> {
    if (!pathObj) {
        throw new Error("pathObj must be provided");
    }

    switch (pathObj.type) {
        case "globs":
            const globs = (<IGlobsPath>pathObj).globs;

            return Array.isArray(globs) ? globs : [globs];

        case "path-ref":
            let pathNames = (<IPathRef>pathObj).names;

            if (!Array.isArray(pathNames)) {
                pathNames = [pathNames];
            }

            return pathNames.map((pathName) => {
                const pathValue = configs.buildInfos.paths[pathName];

                if (!pathValue) {
                    throw new Error(`Unknown path: ${pathName}. A path must be registered under buildInfos:paths`);
                }

                return path.join(pathValue, "**", "*");
            });

        default:
            throw new Error(`Unsupported path type: ${pathObj.type}`);
    }
}
