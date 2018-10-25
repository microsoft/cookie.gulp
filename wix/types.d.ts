//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare interface ILightOptions {
    intermediateDir?: string;

    spdb?: boolean;
    outFileName?: string;
}

declare interface IHeatOptions {
    intermediateDir?: string;

    autoGenerateComponentGuids?: boolean;
    generateGuidsNow?: boolean;
    keepEmptyFolders?: boolean;
    directoryId?: string;
    rootDirectory?: string;
    componentGroupName?: string;
    xsltTemplatePath?: string;
}

declare interface ICandleOptions {
    intermediateDir?: string;

    arch?: "x86" | "x64" | "ia64";
    variables?: IDictionary<string>;
}

// *** If change this interface, please also change wix.schema.json. ***
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