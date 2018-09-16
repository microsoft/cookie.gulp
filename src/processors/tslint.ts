//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as tslint from "tslint";
import gtslint from "gulp-tslint";
import * as fs from "fs";

import { chain } from "../steams-utils";

export = constructProcessor;
const constructProcessor: ProcessorConstructor =
    (config, buildTarget, buildInfos, packageJson): NodeJS.ReadableStream & NodeJS.WritableStream => {
        return chain(
            fs.existsSync("./tsconfig.json") ? gtslint({ program: tslint.Linter.createProgram("./tsconfig.json") }) : gtslint(),
            gtslint.report({ summarizeFailureOutput: true }));
    };
