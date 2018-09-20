//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

export declare function rmdirAsync(path: PathLike): Promise<void>;

export declare function readDirAsync(path: PathLike, options?: { encoding: BufferEncoding | null } | BufferEncoding | null): Promise<string[]>;

export declare function readDirAsync(path: PathLike, options: "buffer" | { encoding: "buffer" }): Promise<Buffer[]>;

export declare function readDirAsync(path: PathLike, options?: { encoding?: string | null } | string | null): Promise<string[] | Buffer[]>;

export declare function statAsync(path: PathLike): Promise<Stats>;

export declare function unlinkAsync(path: PathLike): Promise<void>;

export declare function existsAsync(path: PathLike): Promise<boolean>;

export declare function deleteAsync(targetPath: string): Promise<void>;

export declare function createDirectory(dir: string): void;

export declare function vinyl(filePath: string, base?: string): import("vinyl");
