//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare namespace NodeJS {
    /** The operating system CPU architecture. */
    type Architecture = "arm" | "arm64" | "ia32" | "mips" | "mipsel" | "ppc" | "ppc64" | "s390" | "s390x" | "x32" | "x64";

    interface WritableStream {
        write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean;
    }
}

interface Error {
    code?: string | number;
}

interface IDictionary<TValue> {
    [key: string]: TValue;
}

type DepType = "prod" | "dev" | "optional" | "bundle";

interface IDynamicDependency {
    version?: string;
    depTypes?: Array<DepType>;
    archs?: Array<NodeJS.Architecture>;
    platforms?: Array<NodeJS.Platform>;
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

type ProcessorConstructor = (config: any, buildTarget: IBuildTaget, buildInfos: IBuildInfos, packageJson: IPackageConfig) => NodeJS.ReadWriteStream;