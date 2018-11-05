//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");

const configs = require("../configs");
const fs = require("donuts.node/fileSystem");
const gulpUtils = require("../glob-utils");

gulp.task("init", () => {
    for (const path of Object.values(configs.buildInfos.paths)) {
        if (!gulpUtils.Regex.GlobLike.test(path)) {
            fs.createDirectorySync(path);
        }
    }

    return Promise.resolve();
});