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

declare type ExecutionModel = "parallel" | "series";

declare type GlobLike = string | Array<string>;

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
    tasks: Array<string | IBuildTaskGroup>;
}

declare interface IBuildTasksArray extends Array<string | IBuildTaskGroup | IBuildTasksArray> { }

declare type BuildTaskTree = IBuildTasksArray | IBuildTaskGroup;

declare interface IBuildTaskDictionary {
    [taskName: string]: BuildTaskTree | IBuildTaskDefinition;

    build?: BuildTaskTree | IBuildTaskDefinition;
    publish?: BuildTaskTree | IBuildTaskDefinition;
}

declare interface ICleanTaskConfig {
    globs?: Array<string>;
}

declare interface IBuildTaskConfigDictionary extends IDictionary<any> {
    "clean"?: ICleanTaskConfig;
}

declare interface IPassProcessorConfig {
    baseDir?: string;
}

declare interface IBuildProcessorConfigDictionary extends IDictionary<any> {
    "msi"?: IMsiProcessorConfig;
    "pass"?: IPassProcessorConfig;
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

    targets?: Array<string>;
    paths?: IBuildPaths;
    ignores?: Array<string>;
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

declare type LogLevel = "verbose" | "info" | "warning" | "error" | "exception" | "critical";

declare interface ILog {
    write(level: LogLevel, msg: any, ...args: Array<any>): void;
    verbose(...args: Array<any>): void;
    info(...args: Array<any>): void;
    warning(...args: Array<any>): void;
    error(...args: Array<any>): void;
    exception(...args: Array<any>): void;
    critical(...args: Array<any>): void;
}

declare module "cookie.gulp" {
    interface ICookieGulp {
        (registry?: import("undertaker-registry")): void;

        /**
         * Register a processor to cookie.gulp.
         * @param name The name of the processor.
         * @param constructor The constructor of the processor.
         */
        processor(name: string, constructor: ProcessorConstructor): void;
    }

    declare var CookieGulp: ICookieGulp;
    declare export = CookieGulp;
}
