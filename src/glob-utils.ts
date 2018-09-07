//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as glob from "glob";
import * as path from "path";

export function formGlobs(...globs: Array<string>): Array<string> {
    const gulpfiles = glob.sync("**/gulpfile.js");
    const outputGlobs: Array<string> = [];

    outputGlobs.push(...globs);
    outputGlobs.push(...gulpfiles.map(((fileName) => "!" + path.join(path.dirname(fileName), "**", "*"))));

    return outputGlobs;
}
