//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");

const configs = require("../configs");
const { deleteAsync } = require("../file-system");

gulp.task("clean", () => Promise.all([
    deleteAsync(configs.buildInfos.paths.intermediateDir),
    deleteAsync(configs.buildInfos.paths.buildDir),
    deleteAsync(configs.buildInfos.paths.publishDir)
]));
