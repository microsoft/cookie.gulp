//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="common.d.ts" />

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
    processors: Array<string | IProcessorConfig>;
}

declare interface IBuildTaskGroup {
    executionModel: ExecutionModel;
    tasks: Array<string | IBuildTaskGroup>;
}

declare interface IBuildTasksArray extends Array<string | IBuildTaskGroup | IBuildTasksArray> { }

declare type BuildTaskTree = IBuildTasksArray | IBuildTaskGroup;

declare interface IBuildTaskDictionary {
    [taskName: string]: BuildTaskTree | IBuildTaskDefinition;

    build?: BuildTaskTree | IBuildTaskDefinition;
    publish?: BuildTaskTree | IBuildTaskDefinition;
}

declare interface IMsiProcessorConfig {
    autoGenerateComponentGuids?: boolean;
    generateGuidsNow?: boolean;
    keepEmptyFolders?: boolean;
    rootDirectory?: string;
    componentGroupName?: string;
    xsltTemplatePath?: string;
    wxs: GlobLike;
    variables?: IDictionary<string>;
    spdb?: boolean;
}

declare interface IElectronPackageProcessorConfig {
    asar?: boolean;
    icons?: GlobLike;
    macOS?: {
        appBundleId: string;
        appCategoryType: string;
        helperBundleId?: string;
    }
}

declare interface IElectronLinuxInstallerProcessorConfig {
    section?: string;
    icons?: GlobLike;
    categories?: Array<string>;
}

declare interface ILicensingProcessorConfig {
    "licenses-overrides": IDictionary<string>
}

declare interface IBuildTaskConfigDictionary extends IDictionary<any> {
}

declare interface IBuildProcessorConfigDictionary extends IDictionary<any> {
    "msi"?: IMsiProcessorConfig;
    "electron/pack"?: IElectronPackageProcessorConfig;
    "electron/deb"? : IElectronLinuxInstallerProcessorConfig;
    "electron/rpm"? : IElectronLinuxInstallerProcessorConfig;
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

declare export const packageJson: Readonly<IPackageConfig>;
declare export const buildInfosJson: Readonly<IBuildInfos>;
declare export const buildInfos: IBuildInfos;
