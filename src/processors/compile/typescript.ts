//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as ts from "typescript";
import * as fs from "fs";
import * as tmp from "tmp";

import * as configs from "../../configs";
import * as tsc from "../../components/tsc";
import * as utils from "../../utilities";
import * as log from "../../log";

interface ITsConfig {
    compilerOptions: ts.CompilerOptions;
    include?: Array<string>;
    exclude?: Array<string>;
}

function loadTsConfigJson(): Readonly<ITsConfig> {
    if (!fs.existsSync("./tsconfig.json")) {
        return {
            compilerOptions: {}
        };
    }

    return JSON.parse(fs.readFileSync("./tsconfig.json", "utf8"));
}

export = () => {
    const tsconfig = loadTsConfigJson();
    let tempDir: tmp.ITempObject;

    if (utils.string.isNullUndefinedOrWhitespaces(tsconfig.compilerOptions.outDir)) {
        log.warning("TypeScript", "tsconfig.json", "tsconfig.json:outDir is not specified. A temp directory is created and assigned to it.");
        tempDir = tmp.dirSync({ dir: configs.buildInfos.paths.intermediateDir, unsafeCleanup: true });
        tsconfig.compilerOptions.outDir = tempDir.name;
    }

    const compilerOptionsParseResult = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, undefined);

    if (compilerOptionsParseResult.errors && compilerOptionsParseResult.errors.length > 0) {
        compilerOptionsParseResult.errors.forEach((error) => log.error(`[${error.category}]`, error.messageText));
        throw new Error("Failed to parse tsconfig.json:compilerOptions.");
    }

    return tsc.compile(compilerOptionsParseResult.options);
};
