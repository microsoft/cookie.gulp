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

gulp.task("clean", () => {
    /** @type {Array.<Promise>} */
    const cleanPromises = [];

    cleanPromises.push(deleteAsync(configs.buildInfos.paths.intermediateDir));
    cleanPromises.push(deleteAsync(configs.buildInfos.paths.buildDir));
    cleanPromises.push(deleteAsync(configs.buildInfos.paths.publishDir));

    if (configs.buildInfos.configs.tasks.clean
        && !utils.array.isNullUndefinedOrEmpty(configs.buildInfos.configs.tasks.clean.globs)) {
        
            const additionalPromises =
            glob.sync(configs.buildInfos.configs.tasks.clean.globs, { dot: true })
                .map(
                    /** @param {string} filePath */
                    (filePath) => deleteAsync(filePath));

        cleanPromises.push(...additionalPromises);

        for (const globItem of configs.buildInfos.configs.tasks.clean.globs) {
            if (!globUtils.Regex.GlobLike.test(globItem)) {
                cleanPromises.push(deleteAsync(globItem));
            }
        }
    }

    return Promise.all(cleanPromises);
});
