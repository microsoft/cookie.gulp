//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const { Transform } = require("stream");
const path = require("path");

/**
 * 
 * @param {IPassProcessorConfig} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function constructProcessor(config, buildTarget, buildInfos, packageJson) {

    const baseDir = config.baseDir ? path.resolve(config.baseDir) : undefined;

    return new Transform({
        objectMode: true,

        /** @param {import("vinyl")} chunk */
        transform(chunk, encoding, callback) {
            chunk.base = baseDir || chunk.base;
            this.push(chunk);
            callback();
        }
    });
}
module.exports = constructProcessor;