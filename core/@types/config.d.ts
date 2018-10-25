//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare type DepType = "prod" | "dev" | "optional" | "bundle";

declare type ExecutionModel = "parallel" | "series";

declare interface IPackageConfig extends IDictionary<any> {
    name?: string;
    version?: string;
    description?: string;

    author?: string;
    license?: string;
    homepage?: string;

    dependencies?: IDictionary<string>;
    devDependencies?: IDictionary<string>;
    optionalDependencies?: IDictionary<string>;
    peerDependencies?: IDictionary<string>;
    bundleDependencies?: IDictionary<string>;
    extensionDependencies?: IDictionary<string>;
}

declare interface IBuildPaths {
    [pathName: string]: string;
    intermediateDir?: string;
    publishDir?: string;
    buildDir?: string;
}

declare interface IBuildTaget {
    platform: NodeJS.Platform;
    arch?: NodeJS.Architecture;
}

declare interface IProcessorConfig extends IDictionary<any> {
    name: string;
}

declare interface IBuildTaskDefinition {
    sources?: GlobLike;
    base?: string;
    dest?: string;
    "ignore-target"?: boolean;
    targets?: Array<string>;
    processors: Array<string | IProcessorConfig>;
}

declare interface IBuildTaskGroup {
    executionModel?: ExecutionModel;
    tasks: IBuildTasksArray;
}

declare interface IBuildTasksArray extends Array<string | IBuildTaskGroup | IBuildTasksArray> { }

declare type BuildTaskTree = IBuildTasksArray | IBuildTaskGroup;

declare interface IBuildTaskDictionary {
    [taskName: string]: BuildTaskTree | IBuildTaskDefinition;

    build?: BuildTaskTree | IBuildTaskDefinition;
    publish?: BuildTaskTree | IBuildTaskDefinition;
}

declare interface IBuildInfos {
    productName?: string;
    executableName?: string;

    description?: string;
    copyright?: string;

    buildNumber?: string;

    tasks?: IBuildTaskDictionary;

    configs?: {
        tasks?: IDictionary<any>;
        processors?: IDictionary<any>;
    };

    targets?: Array<string>;
    paths?: IBuildPaths;
    ignores?: Array<string>;
}

declare interface ICleanTaskConfig {
    globs?: Array<string>;
}

declare interface IPassProcessorConfig {
    baseDir?: string;
}
