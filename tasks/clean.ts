//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";

import * as configs from "../configs";
import { deleteAsync } from "../file-system";

gulp.task("clean", () => Promise.all([
    deleteAsync(configs.buildInfos.paths.intermediateDir),
    deleteAsync(configs.buildInfos.paths.buildDir),
    deleteAsync(configs.buildInfos.paths.publishDir)
]));
