//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import * as fs from "fs";
import * as path from "path";

import * as utils from "./utilities";
import * as configs from "./configs";
import * as undertaker from "undertaker";
import { installDynamicDependencies } from "./dynamic-dependency";

function generateTask(taskTree: BuildTaskTree): undertaker.TaskFunction {
    if (utils.isNullOrUndefined(taskTree)) {
        return undefined;
    }

    const executionModel: ExecutionModel = Array.isArray(taskTree) ? "series" : taskTree.executionModel;

    const targetTasks: IBuildTasksArray =
        Array.isArray(taskTree) ? taskTree : taskTree.tasks;

    const createTaskFn: (tasks: undertaker.Task[]) => undertaker.TaskFunction =
        executionModel === "parallel" ? gulp.parallel : gulp.series;

    return createTaskFn(
        targetTasks
            .filter((task) => !utils.isNullOrUndefined(task))
            .map((task) => utils.isString(task) ? task : generateTask(task)));
}

function registerTask(taskName: string, tasks: BuildTaskTree): void {
    const task = generateTask(tasks);

    if (!task) {
        gulp.registry().set(taskName, undefined);
    } else {
        gulp.task(taskName, task);
    }
}

function importTasks(tasksPath: string = "./tasks"): void {
    tasksPath = path.resolve(tasksPath);

    try {
        const stat = fs.statSync(tasksPath);

        if (stat.isDirectory()) {

            if (fs.existsSync(path.join(tasksPath, "package.json"))
                || fs.existsSync(path.join(tasksPath, "index.js"))) {
                require(tasksPath);
            } else {
                fs.readdirSync(tasksPath).forEach((subItem) => importTasks(path.join(tasksPath, subItem)));
            }

        } else if (stat.isFile) {
            require(tasksPath);
        }
    } catch (error) {
        if (error && error.code && error.code === "ENOENT") {
            return;
        }

        throw error;
    }
}

// Import pre-defined tasks.
importTasks();

// Install dynamic dependencies.
installDynamicDependencies();

// Check if tasks are configured.
if (configs.buildInfos.tasks) {
    for (const taskName of Object.keys(configs.buildInfos.tasks)) {
        registerTask(taskName, configs.buildInfos.tasks[taskName]);
    }
}
