//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare type MsiArch = "x86" | "x64" | "ia64";

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