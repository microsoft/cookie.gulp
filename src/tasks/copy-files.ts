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
    "!**/*.tsx",
    "!**/*.ts",
    "!**/*.scss",
    "!**/*.sass",
    "!**/*.less",
    "!**/*.vbproj",
    "!**/*.csproj",
    "!**/*.vcxproj",
    "!**/*.sln",
    "!**/*.proj",
    "!**/CMakeLists",
    "!**/CMakeLists.*",
    "!**/*.xaml",
    "!**/*.fs",
    "!**/*.fsi",
    "!**/*.java",
    "!**/*.vb",
    "!**/*.cs",
    "!**/*.cpp",
    "!**/*.c",
    "!**/*.cc",
    "!**/*.h"];

gulp.task("copy-files", () => {
    let globs: Array<string> = utils.object.getPropertyValue(configs.buildInfos, "taskConfigs.copy-files.globs") || [];

    if (!Array.isArray(globs)) {
        throw new Error("Invalid value for buildinfos.taskConfigs.copy-files.globs. This value must be an array of string.");
    }

    if (true === utils.object.getPropertyValue(configs.buildInfos, "taskConfigs.copy-files.globs", true)) {
        globs = DefaultGlobs.concat(globs);
    }

    return gulp
        .src(globUtils.formGlobs(...globs), { dot: true })
        .pipe(gulp.dest(configs.buildInfos.paths.destDir));
});
