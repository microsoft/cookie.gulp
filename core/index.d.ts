//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="./@types/node.d.ts" />
/// <reference path="./@types/common.d.ts" />
/// <reference path="./@types/config.d.ts" />
/// <reference path="./@types/log.d.ts" />

declare module "cookie.gulp" {
    interface ICookieGulp {
        (registry?: import("undertaker-registry")): void;

        /**
         * Register a processor to cookie.gulp.
         * @param name The name of the processor.
         * @param constructor The constructor of the processor.
         */
        processor(name: string, constructor: ProcessorConstructor): void;
    }

    declare var CookieGulp: ICookieGulp;
    declare export = CookieGulp;
}
