//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";

import * as utils from "../utilities";
import * as configs from "../configs";
import * as globUtils from "../glob-utils";

const defaultGlobs: Array<string> = [
    "**/*.css",
    "**/*.eot",
    "**/*.svg",
    "**/*.ttf",
    "**/*.woff",

    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.bmp",
    "**/*.ico",
    "**/*.icns",
    "**/*.gif",

    "**/*.pem",
    "**/*.pfx",
    "**/*.cert",
    "**/*.cer",
    "**/*.key",

    "**/*.ps1",
    "**/*.cmd",
    "**/*.sh",
    "**/*.bat",
    "**/*.txt",
    "**/*.js",
    "**/*.json",
    "**/*.cson",
    "**/*.yml",
    "**/*.yaml",
    "**/*.xml",
    "**/*.htm",
    "**/*.html"];

gulp.task("copy-files", () => {
    let globs: Array<string> = utils.object.getPropertyValue(configs.buildInfos, "taskConfigs.copy-files.globs");

    if (utils.isNullOrUndefined(globs)) {
        globs = defaultGlobs;

    } else if (!Array.isArray(globs)) {
        throw new Error("Invalid value for buildinfos.taskConfigs.copy-files.globs. This value must be an array of string.");
    }

    return gulp
        .src(globUtils.formGlobs(...globs))
        .pipe(gulp.dest(configs.buildInfos.paths.destDir));
});
