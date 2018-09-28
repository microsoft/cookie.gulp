//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");
const glob = require("fast-glob");

const utils = require("../utilities");
const globUtils = require("../glob-utils");
const configs = require("../configs");
const { deleteAsync } = require("../file-system");

gulp.task("clean", async () => {
    await deleteAsync(configs.buildInfos.paths.intermediateDir);
    await deleteAsync(configs.buildInfos.paths.buildDir);
    await deleteAsync(configs.buildInfos.paths.publishDir);

    if (configs.buildInfos.configs.tasks.clean
        && !utils.array.isNullUndefinedOrEmpty(configs.buildInfos.configs.tasks.clean.globs)) {
        
            const additionalPromises =
            glob.sync(configs.buildInfos.configs.tasks.clean.globs, { dot: true })
                .map(
                    /** @param {string} filePath */
                    async (filePath) => await deleteAsync(filePath));

        await Promise.all(additionalPromises);

        for (const globItem of configs.buildInfos.configs.tasks.clean.globs) {
            if (!globUtils.Regex.GlobLike.test(globItem)) {
                await deleteAsync(globItem);
            }
        }
    }
});
