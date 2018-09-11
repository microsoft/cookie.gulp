//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";

import * as utils from "../utilities";
import * as configs from "../configs";
import * as globUtils from "../glob-utils";

const DefaultGlobs: Array<string> = [
    "**/*",
    "!**/CMakeLists",
    "!**/CMakeLists.*",
    "!**/*.vbproj",
    "!**/*.csproj",
    "!**/*.vcxproj",
    "!**/*.sln",
    "!**/*.proj",
    "!**/*.xaml",
    "!**/*.fs",
    "!**/*.fsi",
    "!**/*.java",
    "!**/*.vb",
    "!**/*.cs",
    "!**/*.cpp",
    "!**/*.c",
    "!**/*.cc",
    "!**/*.h",
    "!**/*.scss",
    "!**/*.sass",
    "!**/*.less",
    "!**/*.tsx",
    "!**/*.ts"];

gulp.task("copy-files", () => {
    let globs: Array<string> = utils.object.getPropertyValue(configs.buildInfos, "taskConfigs.copy-files.globs") || [];

    if (!Array.isArray(globs)) {
        throw new Error("Invalid value for buildinfos.taskConfigs.copy-files.globs. This value must be an array of string.");
    }

    if (true === utils.object.getPropertyValue(configs.buildInfos, "taskConfigs.copy-files.globs", true)) {
        globs.push(...DefaultGlobs);
    }

    return gulp
        .src(globUtils.formGlobs(...globs))
        .pipe(gulp.dest(configs.buildInfos.paths.destDir));
});
