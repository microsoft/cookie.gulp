//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as fs from "fs";

export interface IBuildConfig {
    readonly srcDir?: string;
    readonly destDir?: string;
}

export interface IBuildInfos {
    srcDir: string;
    destDir: string;
}

