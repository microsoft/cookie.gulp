//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare interface IRegex {
    PathRef: RegExp;
    GlobLike: RegExp;
}

export declare const Regex: IRegex;

export declare function normalizeGlobs(...globs: Array<string>): Array<string>;

export declare function toGlobs(globlike: import("./configs").GlobLike, exts?: string | Array<string>): Array<string>;

export declare function applyIgnores(...globs: Array<string>): Array<string>;