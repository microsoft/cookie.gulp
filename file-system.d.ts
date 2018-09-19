//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference types="node" />

import * as fs from "fs";

export declare const rmdirAsync: typeof fs.rmdir.__promisify__;

export declare const readDirAsync: typeof fs.readdir.__promisify__;

export declare const statAsync: typeof fs.stat.__promisify__;

export declare const unlinkAsync: typeof fs.unlink.__promisify__;

export declare const existsAsync: typeof fs.exists.__promisify__;

export declare function deleteAsync(targetPath: string): Promise<void>;
