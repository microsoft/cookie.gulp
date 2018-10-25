//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

// *** If change this interface, please also change the corresponding schema json in schemas folder. ***
declare interface IElectronLinuxInstallerProcessorConfig {
    section?: string;
    icons?: GlobLike;
    categories?: Array<string>;
}

// *** If change this interface, please also change the corresponding schema json in schemas folder. ***
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