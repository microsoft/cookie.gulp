//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare namespace NodeJS {
    /** The operating system CPU architecture. */
    type Architecture = "arm" | "arm64" | "ia32" | "mips" | "mipsel" | "ppc" | "ppc64" | "s390" | "s390x" | "x32" | "x64";

    interface WritableStream {
        write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean;
    }
}
