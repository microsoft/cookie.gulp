//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare interface IBuildPaths {
    [pathName: string]: string;
    intermediateDir?: string;
    publishDir?: string;
    buildDir?: string;
}

declare interface IBuildTargetConfig {
    platform: NodeJS.Platform;
    archs: Array<NodeJS.Architecture>;
}

declare interface IBuildTaget {
    platform: NodeJS.Platform;
    arch?: NodeJS.Architecture;
}

declare type ExecutionModel = "parallel" | "series";

declare type GlobLike = string | Array<string>;

declare interface IProcessorConfig extends IDictionary<any> {
    name: string;
}

declare interface IBuildTaskDefinition {
    sources?: GlobLike;
    dest?: string;
    "ignore-target"?: boolean;
    processors: Array<string | IProcessorConfig>;
}

declare interface IBuildTaskGroup {
    executionModel?: ExecutionModel;
    tasks: Array<string | IBuildTaskGroup>;
}

declare interface IBuildTasksArray extends Array<string | IBuildTaskGroup | IBuildTasksArray> { }

declare type BuildTaskTree = IBuildTasksArray | IBuildTaskGroup;

declare interface IBuildTaskDictionary {
    [taskName: string]: BuildTaskTree | IBuildTaskDefinition;

    build?: BuildTaskTree | IBuildTaskDefinition;
    publish?: BuildTaskTree | IBuildTaskDefinition;
}

declare interface IBuildTaskConfigDictionary extends IDictionary<any> {
    "clean"?: ICleanTaskConfig;
}

declare interface IBuildProcessorConfigDictionary extends IDictionary<any> {
    "msi"?: IMsiProcessorConfig;
    "pass"?: IPassProcessorConfig;
    "electron/pack"?: IElectronPackageProcessorConfig;
    "electron/deb"?: IElectronLinuxInstallerProcessorConfig;
    "electron/rpm"?: IElectronLinuxInstallerProcessorConfig;
}

declare interface IBuildInfos {
    productName?: string;
    executableName?: string;

    description?: string;
    copyright?: string;

    buildNumber?: string;

    tasks?: IBuildTaskDictionary;

    configs?: {
        tasks?: IBuildTaskConfigDictionary;
        processors?: IBuildProcessorConfigDictionary;
    };

    targets?: Array<IBuildTargetConfig>;
    paths?: IBuildPaths;
    ignores?: Array<string>;
}
