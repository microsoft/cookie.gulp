//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import * as fs from "fs";
import * as path from "path";
import * as cp from "child_process";
import * as glob from "fast-glob";

import * as gulpUtils from "./glob-utils";
import * as utils from "./utilities";
import * as configs from "./configs";
import * as undertaker from "undertaker";
import { installDynamicDependencies } from "./dynamic-dependency";

function executeGulp(taskName: string, cwd: string): cp.ChildProcess {
    return cp.exec(`gulp ${taskName}`, { cwd: cwd });
}

function executeSubTasks(taskName: string): undertaker.TaskFunction {
    const taskFuncs: Array<undertaker.TaskFunction> = [];

    for (const gulpfile of glob.sync<string>("**/gulpfile.js", { dot: true })) {
        taskFuncs.push(executeGulp.bind(null, taskName, path.dirname(gulpfile)));
    }

    return gulp.series(taskFuncs);
}

function isBuildTaskTree(value: any): value is BuildTaskTree {
    return value
        && (Array.isArray(value)
            || (<IBuildTaskGroup>value).executionModel === "parallel"
            || (<IBuildTaskGroup>value).executionModel === "series");
}

function isBuildTaskDef(value: any): value is IBuildTaskDefinition {
    return value && Array.isArray((<IBuildTaskDefinition>value).processors);
}

function generateTaskByBuildTaskTree(taskTree: BuildTaskTree): undertaker.TaskFunction {
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
            .map((task) => utils.isString(task) ? task : generateTaskByBuildTaskTree(task)));
}

function registerTaskByBuildTaskTree(taskName: string, tasks: BuildTaskTree): void {
    const task = generateTaskByBuildTaskTree(tasks);

    if (!task) {
        gulp.registry().set(taskName, undefined);
        return;
    }

    gulp.task(taskName,
        gulp.series(
            task,
            executeSubTasks(taskName)));
}

function generateTaskByProcessors(
    taskDef: IBuildTaskDefinition,
    targetConfig: IBuildTaget): undertaker.TaskFunction {
    if (!Array.isArray(taskDef.processors) || taskDef.processors.length <= 0) {
        throw new Error("taskDef.processors (Array<string>) must be provided.");
    }

    let lastProcessor: NodeJS.ReadableStream & NodeJS.WritableStream;

    lastProcessor =
        gulp.src(
            taskDef.sources ? gulpUtils.toGlobs(taskDef.sources) : gulpUtils.normalizeGlobs("**/*"),
            { dot: true });

    for (const processorRef of taskDef.processors) {
        let processorName: string;

        if (utils.isString(processorRef)) {
            processorName = processorRef;
        } else {
            processorName = processorRef.name;
        }

        if (utils.string.isNullUndefinedOrWhitespaces(processorName)) {
            throw new Error("processor name must be provided. (null/undefined/empty/whitespaces are not acceptable).");
        }

        const processorConfig =
            Object.assign(
                Object.create(null),
                configs.buildInfos.configs.processors[processorName],
                utils.isString(processorRef) ? null : processorRef);
        const constructProcessor: ProcessorConstructor = require(`./processors/${processorName}`);

        lastProcessor =
            lastProcessor.pipe(
                constructProcessor(
                    processorConfig,
                    targetConfig,
                    configs.buildInfos,
                    configs.packageJson));
    }

    lastProcessor = lastProcessor.pipe(gulp.dest(taskDef.dest || configs.buildInfos.paths.buildDir, { overwrite: true }));

    return () => lastProcessor;
}

function registerTaskByProcessors(taskName: string, taskDef: IBuildTaskDefinition): void {
    if (configs.buildInfos.targets.length <= 0) {
        gulp.task(taskName, generateTaskByProcessors(taskDef, undefined));
        return;
    }

    const subTasks: Array<string> = [];

    for (const targetConfig of configs.buildInfos.targets) {
        const subTaskName: string = `${taskName}:${targetConfig.platform}`;

        subTasks.push(subTaskName);

        if (!targetConfig.archs || targetConfig.archs.length <= 0) {
            gulp.task(
                subTaskName,
                generateTaskByProcessors(taskDef, { platform: targetConfig.platform }));

        } else {
            const childTasks: Array<string> = [];

            for (const arch of targetConfig.archs) {
                const childTaskName: string = `${subTaskName}@${arch}`;

                childTasks.push(childTaskName);

                gulp.task(
                    childTaskName,
                    generateTaskByProcessors(taskDef, { platform: targetConfig.platform, arch: arch }));
            }

            gulp.task(subTaskName, gulp.series(childTasks));
        }
    }

    gulp.task(taskName, gulp.series(subTasks));
}


function registerTask(taskName: string, tasks: BuildTaskTree | IBuildTaskDefinition): void {
    if (isBuildTaskTree(tasks)) {
        registerTaskByBuildTaskTree(taskName, tasks);

    } else if (isBuildTaskDef(tasks)) {
        registerTaskByProcessors(taskName, tasks);

    } else {
        throw new Error("Invalid buildInfos:tasks.");
    }
}

function configureTasks(): void {
    for (const taskName of Object.keys(configs.buildInfos.tasks)) {
        registerTask(taskName, configs.buildInfos.tasks[taskName]);
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

// Configure tasks.
configureTasks();
