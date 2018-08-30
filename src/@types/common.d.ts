//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

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

interface IBuildInfos {
    productName?: string;
    description?: string;
    copyright?: string;

    buildNumber?: string;

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