//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare export function isModuleInstalled(modulePath: string): boolean;

declare export function installDynamicDependency(depName: string, dep: IDynamicDependency): void;

declare export function installDynamicDependencies(): void;
