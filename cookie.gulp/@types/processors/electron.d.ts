//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare interface IElectronLinuxInstallerProcessorConfig {
    section?: string;
    icons?: GlobLike;
    categories?: Array<string>;
}

declare interface IElectronPackageProcessorConfig {
    asar?: boolean;
    icon?: string;
    output?: "files" | "dir";
    macOS?: {
        appBundleId: string;
        appCategoryType: string;
        helperBundleId?: string;
    }
}