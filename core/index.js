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

const utils = require("donuts.node/utils");
const globUtils = require("./glob-utils");
const configs = require("./configs");
const { installDynamicDependencies } = require("./dynamic-dependency");

/** @type {IDictionary.<ProcessorConstructor>} */
const processorDictionary = Object.create(null);

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

        const base = (taskDef.base || path.resolve("."))
            .replace(globUtils.Regex.PathRef, (match, pathName) => configs.buildInfos.paths[pathName]);

        lastProcessor =
            gulp.src(taskDef.sources ? globUtils.toGlobs(taskDef.sources) : globUtils.normalizeGlobs("**/*"), { dot: true, base: base });

        for (const processorRef of taskDef.processors) {
            /** @type {string} */
            let processorName;

            if (utils.isString(processorRef)) {
                processorName = processorRef;
            } else {
                processorName = processorRef.name;
            }

            if (!utils.isString(processorName) || utils.string.isEmptyOrWhitespace(processorName)) {
                throw new Error("processor name must be provided. (null/undefined/empty/whitespaces are not acceptable).");
            }

            /** @type {*} */
            const processorConfig = Object.assign(Object.create(null), configs.buildInfos.configs.processors[processorName], utils.isString(processorRef) ? null : processorRef);

            /** @type {ProcessorConstructor} */
            const constructProcessor = processorDictionary[processorName];

            if (!constructProcessor) {
                throw new Error(`Unknown processor: ${processorName}`);
            }

            lastProcessor =
                lastProcessor.pipe(constructProcessor(processorConfig, targetConfig, configs.buildInfos, configs.packageJson));
        }

        const dest = (taskDef.dest || configs.buildInfos.paths.buildDir)
            .replace(globUtils.Regex.PathRef, (match, pathName) => configs.buildInfos.paths[pathName]);

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

    /** @type {RegExp} */
    const targetRegex = /^([A-Za-z0-9\-\_]+)(\@([A-Za-z0-9\-\_]+))?$/i;

    for (const target of configs.buildInfos.targets) {
        const targetMatchResult = targetRegex.exec(target);

        if (!targetMatchResult) {
            throw new Error(`Build target is not valid: ${target}`);
        }

        /** @type {IBuildTaget} */
        const buildTarget = {
            // @ts-ignore
            platform: targetMatchResult[1],

            // @ts-ignore
            arch: targetMatchResult[3]
        };

        if (buildTarget.platform !== process.platform) {
            continue;
        }

        if (taskDef.targets
            && !taskDef.targets.find((targetItem) => targetItem === buildTarget.platform || targetItem === target)) {
            continue;
        }

        const subTaskName = `${taskName}:${buildTarget.platform}${buildTarget.arch ? "@" + buildTarget.arch : ""}`;

        subTasks.push(subTaskName);
        gulp.task(subTaskName, generateTaskByProcessors(taskDef, buildTarget));
    }

    gulp.task(taskName,
        subTasks.length > 0
            ? gulp.series(subTasks)
            : () => {
                console.log("TASK", "Target", `Skipping: Task "${taskName}" has no matched targets.`);
                return Promise.resolve();
            });
}

/**
 * 
 * @param {string} taskName 
 * @param {BuildTaskTree | IBuildTaskDefinition} tasks 
 */
function registerTask(taskName, tasks) {
    if (!tasks) {
        gulp.registry().set(taskName, undefined);

    } else if (isBuildTaskTree(tasks)) {
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

function importBuiltInExtensions() {
    /** @type {Array.<string>} */
    const backlog = [
        path.join(__dirname, "tasks"),
        path.join(__dirname, "processors")
    ];

    /** @type {string} */
    let currentItem;

    while (currentItem = backlog.shift()) {
        if (!fs.existsSync(currentItem)) {
            continue;
        }

        const stat = fs.statSync(currentItem);

        if (stat.isDirectory()) {
            if (fs.existsSync(path.join(currentItem, "package.json"))
                || fs.existsSync(path.join(currentItem, "index.js"))) {
                require(currentItem);

            } else {
                backlog.push(...fs.readdirSync(currentItem).map((entry) => path.join(currentItem, entry)));
            }

        } else if (stat.isFile() && path.extname(currentItem) === ".js") {
            require(currentItem);
        }
    }
}

function importExtensions() {
    /** @type {Array.<string>} */
    const backlog = [];

    // @ts-ignore;
    for (const nodeModulesDir of module.paths) {
        if (fs.existsSync(nodeModulesDir)) {
            backlog.push(nodeModulesDir);
        }
    }

    /** @type {string} */
    let currentItem;
    const cookieGulpExtensionRegex = /^cookie\.gulp\-.+$/i;

    while (currentItem = backlog.shift()) {
        const stat = fs.statSync(currentItem);

        if (!stat.isDirectory()) {
            continue;
        }

        for (const entry of fs.readdirSync(currentItem)) {
            if (!cookieGulpExtensionRegex.test(entry)) {
                continue;
            }

            require(path.join(currentItem, entry));
        }
    }
}

/**
 * 
 * @param {import("undertaker-registry")} registry 
 */
function init(registry) {
    if (registry) {
        gulp.registry(registry);
    }

    // Install dynamic dependencies.
    installDynamicDependencies();

    // Import built-in extensions.
    importBuiltInExtensions();

    // Import extensions.
    importExtensions();

    // Configure tasks.
    configureTasks();
}
module.exports = init;

/**
 * Register a processor to cookie.gulp.
 * @param {string} name The name of the processor.
 * @param {ProcessorConstructor} constructor The constructor of the processor.
 */
function processor(name, constructor) {
    if (!utils.isString(name)) {
        throw new Error("name must be a string.");
    }

    if (!utils.isFunction(constructor)) {
        throw new Error("constructor must be a function.");
    }

    processorDictionary[name] = constructor;
}
module.exports.processor = processor;
