//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

interface Error {
    code?: string | number;
}

interface IDictionary<TValue> {
    [key: string]: TValue;
}

interface IBuildPaths {
    [pathName: string]: string;
    destDir?: string;
}

interface IBuildTargetConfig {
    platform: NodeJS.Platform;
    archs: Array<NodeJS.Architecture>;
}

type ExecutionModel = "parallel" | "series";

interface IBuildTaskGroup {
    executionModel: ExecutionModel;
    tasks: Array<string | IBuildTaskGroup>;
}

interface IBuildTasksArray extends Array<string | IBuildTaskGroup | IBuildTasksArray> { }

type BuildTaskTree = IBuildTasksArray | IBuildTaskGroup;

interface IBuildTaskDictionary {
    [taskName: string]: BuildTaskTree;

    build?: BuildTaskTree;
    publish?: BuildTaskTree;
}

interface IBuildInfos {
    productName?: string;
    description?: string;
    copyright?: string;

    buildNumber?: string;

    tasks?: IBuildTaskDictionary;

    targets?: Array<IBuildTargetConfig>;
    paths?: IBuildPaths;
}

interface IPackageConfig {
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