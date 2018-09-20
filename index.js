//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const glob = require("fast-glob");

const globUtils = require("./glob-utils");
const utils = require("./utilities");
const configs = require("./configs");
const { installDynamicDependencies } = require("./dynamic-dependency");

/**
 * Execute gulp task.
 * @param {string} taskName 
 * @param {string} cwd 
 * @returns {import("child_process").ChildProcess}
 */
function executeGulp(taskName, cwd) {
    return cp.exec(`gulp ${taskName}`, { cwd: cwd });
}

/**
 * Execute sub gulpfile.js with specific task.
 * @param {string} taskName 
 * @returns {import("undertaker").TaskFunction}
 */
function executeSubTasks(taskName) {
    /** @type {Array.<import("undertaker").TaskFunction>} */
    const taskFuncs = [];

    for (const gulpfile of glob.sync(globUtils.applyIgnores("**/gulpfile.js", "!./gulpfile.js"), { dot: true })) {
        // @ts-ignore
        taskFuncs.push(executeGulp.bind(null, taskName, path.dirname(gulpfile)));
    }

    if (taskFuncs.length <= 0) {
        return undefined;
    }

    return gulp.series(taskFuncs);
}

/**
 * Check if value is BuildTaskTree.
 * @param {*} value 
 * @returns {boolean} True if value is BuildTaskTree. Otherwise, false.
 */
function isBuildTaskTree(value) {
    return value
        && (Array.isArray(value)
            || value.executionModel === "parallel"
            || value.executionModel === "series");
}

/**
 * Check if value is IBuildTaskDefinition.
 * @param {*} value 
 * @returns {boolean} True if value is IBuildTaskDefinition. Otherwise, false.
 */
function isBuildTaskDef(value) {
    return value && Array.isArray(value.processors);
}

/**
 * 
 * @param {BuildTaskTree} taskTree
 * @returns {import("undertaker").TaskFunction}
 */
function generateTaskByBuildTaskTree(taskTree) {
    if (utils.isNullOrUndefined(taskTree)) {
        return undefined;
    }

    const executionModel = Array.isArray(taskTree) ? "series" : taskTree.executionModel;
    const targetTasks = Array.isArray(taskTree) ? taskTree : taskTree.tasks;
    const createTaskFn = executionModel === "parallel" ? gulp.parallel : gulp.series;

    return createTaskFn(targetTasks
        .filter((task) => !utils.isNullOrUndefined(task))
        .map((task) => utils.isString(task) ? task : generateTaskByBuildTaskTree(task)));
}

/**
 * 
 * @param {string} taskName 
 * @param {BuildTaskTree} tasks 
 */
function registerTaskByBuildTaskTree(taskName, tasks) {
    const task = generateTaskByBuildTaskTree(tasks);

    if (!task) {
        gulp.registry().set(taskName, undefined);

        return;
    }

    const subTask = executeSubTasks(taskName);

    gulp.task(taskName, subTask ? gulp.series(task, subTask) : task);
}

/**
 * 
 * @param {IBuildTaskDefinition} taskDef 
 * @param {IBuildTaget} targetConfig 
 * @returns {import("undertaker").TaskFunction}
 */
function generateTaskByProcessors(taskDef, targetConfig) {
    if (!Array.isArray(taskDef.processors)) {
        throw new Error("taskDef.processors (Array<string>) must be provided.");
    }

    return () => {
        /** @type {NodeJS.ReadWriteStream} */
        let lastProcessor;

        lastProcessor =
            gulp.src(taskDef.sources ? globUtils.toGlobs(taskDef.sources) : globUtils.normalizeGlobs("**/*"), { dot: true });

        for (const processorRef of taskDef.processors) {
            /** @type {string} */
            let processorName;

            if (utils.isString(processorRef)) {
                processorName = processorRef;
            } else {
                processorName = processorRef.name;
            }

            if (utils.string.isNullUndefinedOrWhitespaces(processorName)) {
                throw new Error("processor name must be provided. (null/undefined/empty/whitespaces are not acceptable).");
            }

            /** @type {*} */
            const processorConfig = Object.assign(Object.create(null), configs.buildInfos.configs.processors[processorName], utils.isString(processorRef) ? null : processorRef);

            /** @type {ProcessorConstructor} */
            const constructProcessor = require(`./processors/${processorName}`);

            lastProcessor =
                lastProcessor.pipe(constructProcessor(processorConfig, targetConfig, configs.buildInfos, configs.packageJson));
        }

        let dest = taskDef.dest || configs.buildInfos.paths.buildDir;
        const destMatchResult = globUtils.Regex.PathRef.exec(dest);

        if (destMatchResult) {
            dest = configs.buildInfos.paths[destMatchResult[1]];
        }

        return lastProcessor.pipe(gulp.dest(dest, { overwrite: true }));
    }
}

/**
 * 
 * @param {string} taskName 
 * @param {IBuildTaskDefinition} taskDef 
 */
function registerTaskByProcessors(taskName, taskDef) {
    if (configs.buildInfos.targets.length <= 0
        || taskDef["ignore-target"] === true) {
        gulp.task(taskName, generateTaskByProcessors(taskDef, undefined));

        return;
    }

    /** @type {Array.<string>} */
    const subTasks = [];

    for (const targetConfig of configs.buildInfos.targets) {
        if (targetConfig.platform !== process.platform) {
            continue;
        }

        const subTaskName = `${taskName}:${targetConfig.platform}`;

        subTasks.push(subTaskName);

        if (!targetConfig.archs || targetConfig.archs.length <= 0) {
            gulp.task(subTaskName, generateTaskByProcessors(taskDef, { platform: targetConfig.platform }));

        } else {
            /** @type {Array.<string>} */
            const childTasks = [];

            for (const arch of targetConfig.archs) {
                const childTaskName = `${subTaskName}@${arch}`;

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

/**
 * 
 * @param {string} taskName 
 * @param {BuildTaskTree | IBuildTaskDefinition} tasks 
 */
function registerTask(taskName, tasks) {
    if (isBuildTaskTree(tasks)) {
        // @ts-ignore
        registerTaskByBuildTaskTree(taskName, tasks);

    }
    else if (isBuildTaskDef(tasks)) {
        // @ts-ignore
        registerTaskByProcessors(taskName, tasks);

    }
    else {
        throw new Error("Invalid buildInfos:tasks.");
    }
}

function configureTasks() {
    for (const taskName of Object.keys(configs.buildInfos.tasks)) {
        registerTask(taskName, configs.buildInfos.tasks[taskName]);
    }
}

/**
 * 
 * @param {string} tasksPath 
 */
function importTasks(tasksPath = path.join(__dirname, "./tasks")) {
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
