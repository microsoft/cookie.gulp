//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare function constructProcessor(
    config: any,
    buildTarget: IBuildTaget,
    buildInfos: IBuildInfos,
    packageJson: IPackageConfig): NodeJS.ReadableStream & NodeJS.WritableStream;
export = constructProcessor;