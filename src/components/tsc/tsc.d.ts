//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { CompilerOptions } from "typescript";

declare namespace tsc {
    function compile(options?: CompilerOptions): void;
}

export = tsc;
