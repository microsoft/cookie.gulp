//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";

import * as configs from "../configs";
import { deleteAsync } from "../file-system";

gulp.task("clean", () => deleteAsync(configs.buildInfos.paths.destDir));
