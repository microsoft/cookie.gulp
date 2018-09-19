//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as glob from "fast-glob";
import * as path from "path";

import * as configs from "./configs";

namespace Regex {
    export const PathRef = /^\<([^\<\>]+)\>$/ig;
    export const GlobLike = /[\^\*\!\+\?\@\|]+/ig;
}

export function normalizeGlobs(...globs: Array<string>): Array<string> {
    const gulpfiles: Array<string> = glob.sync("**/gulpfile.js");
    const outputGlobs: Array<string> = [];

    outputGlobs.push(...globs);
    outputGlobs.push(...gulpfiles.map(((fileName) => "!" + path.join(path.dirname(fileName), "**", "*"))));

    for (const ignoredPath of configs.buildInfos.ignores) {
        const ignoredGlobs = toGlob(ignoredPath);

        for (const ignoredGlob of ignoredGlobs) {
            outputGlobs.push("!" + ignoredGlob);
        }
    }

    return outputGlobs;
}

function toGlob(globlike: string, exts?: Array<string>): Array<string> {
    const finalizedGlobs: Array<string> = [];

    let regexResult: RegExpExecArray;
    let glob: string;

    if (regexResult = Regex.PathRef.exec(globlike)) {
        glob = configs.buildInfos.paths[regexResult[1]];

    } else if (regexResult = Regex.GlobLike.exec(globlike)) {
        finalizedGlobs.push(glob);
        return finalizedGlobs;

    } else {
        glob = globlike;
    }

    if (!exts || exts.length <= 0) {
        if (glob.endsWith("/") || glob.endsWith("\\")) {
            finalizedGlobs.push(glob.substr(0, glob.length - 1));
        } else {
            finalizedGlobs.push(glob);
        }

        finalizedGlobs.push(path.join(glob, "**", "*"));

    } else {
        for (const ext of exts) {
            finalizedGlobs.push(path.join(glob, "**", `*.${ext}`));
        }
    }

    return finalizedGlobs;
}

export function toGlobs(globlike: GlobLike, exts?: string | Array<string>): Array<string> {
    if (!globlike) {
        throw new Error("path must be provided");
    }

    if (exts) {
        if (typeof exts === "string") {
            exts = [exts];
        } else if (!Array.isArray(exts)) {
            throw new Error("Unsupport value of param, exts");
        }
    }

    if (typeof globlike === "string") {
        globlike = [globlike];
    } else if (!Array.isArray(globlike)) {
        throw new Error("Invalid value of param globlike. Only string | Array<string> is accepted.");
    }

    const results: Array<string> = [];

    for (const globlikeItem of globlike) {
        const globs = toGlob(globlikeItem, <Array<string>>exts);

        results.push(...globs);
    }

    return normalizeGlobs(...results);
}
