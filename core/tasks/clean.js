//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

const gulp = require("gulp");
const glob = require("fast-glob");

const utils = require("donuts.node/utils");
const globUtils = require("../glob-utils");
const configs = require("../configs");
const { removeDirectoryAsync, removeFileAsync } = require("donuts.node/fileSystem");

gulp.task("clean", async () => {
    await removeDirectoryAsync(configs.buildInfos.paths.intermediateDir);
    await removeDirectoryAsync(configs.buildInfos.paths.buildDir);
    await removeDirectoryAsync(configs.buildInfos.paths.publishDir);

    /** @type {ICleanTaskConfig} */
    const cleanTaskConfig = configs.buildInfos.configs.tasks.clean;

    if (cleanTaskConfig && !utils.array.isNullUndefinedOrEmpty(cleanTaskConfig.globs)) {
        const additionalPromises =
            glob.sync(configs.buildInfos.configs.tasks.clean.globs, { dot: true })
                .map(
                    /** @param {string} filePath */
                    async (filePath) => await removeFileAsync(filePath));

        await Promise.all(additionalPromises);

        for (const globItem of configs.buildInfos.configs.tasks.clean.globs) {
            if (!globUtils.Regex.GlobLike.test(globItem)) {
                await removeFileAsync(globItem);
            }
        }
    }
});
