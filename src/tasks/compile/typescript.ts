//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import * as tsc from "../../components/tsc";

gulp.task("compile@typescript", () => {
    const tsconfig = config.tsConfig;
    const compilterOptionsParseResult = ts.convertCompilerOptionsFromJson(tsconfig.compilerOptions, undefined);

    tsc.compile();
});