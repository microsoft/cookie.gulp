//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

"use strict";

const gulp = require("gulp");

gulp.task("compile:typescripts", function () {
    const tsc = require("./src/components/tsc");

    return gulp.src("src/**/*.ts").pipe(tsc.compile({})).pipe(gulp.dest("build"));
});

gulp.task("build", gulp.series("compile:typescripts"));