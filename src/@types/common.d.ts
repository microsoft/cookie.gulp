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

type DepType = "prod" | "dev" | "optional" | "bundle";

interface IDynamicDependency {
    version: string;
    depTypes: Array<DepType>;
    archs: Array<NodeJS.Architecture>;
    platforms: Array<NodeJS.Platform>;
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

    dynamicDependencies?: IDictionary<IDynamicDependency>;
}

type ProcessorConstructor = (config: any, buildTarget: IBuildTaget, buildInfos: IBuildInfos) => NodeJS.WritableStream & NodeJS.ReadableStream;