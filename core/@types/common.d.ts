//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

interface IDictionary<TValue> {
    [key: string]: TValue;
}

declare type GlobLike = string | Array<string>;

declare type ProcessorConstructor = (config: any, buildTarget: IBuildTaget, buildInfos: IBuildInfos, packageJson: IPackageConfig) => NodeJS.ReadWriteStream;
