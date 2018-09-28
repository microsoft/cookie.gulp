//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare type LogLevel = "verbose" | "info" | "warning" | "error" | "exception" | "critical";

declare interface ILog {
    write(level: LogLevel, msg: any, ...args: Array<any>): void;
    verbose(...args: Array<any>): void;
    info(...args: Array<any>): void;
    warning(...args: Array<any>): void;
    error(...args: Array<any>): void;
    exception(...args: Array<any>): void;
    critical(...args: Array<any>): void;
}