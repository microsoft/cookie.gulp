//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { GlobLike } from "./configs";

export declare function normalizeGlobs(...globs: Array<string>): Array<string>;

export declare function toGlobs(globlike: GlobLike, exts?: string | Array<string>): Array<string>;
