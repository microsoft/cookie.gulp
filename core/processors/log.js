//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const { Transform } = require("stream");
const VinylFile = require("vinyl");

/**
 * 
 * @param {IProcessorConfig} config 
 * @param {IBuildTaget} buildTarget 
 * @param {IBuildInfos} buildInfos 
 * @param {IPackageConfig} packageJson 
 * @returns {NodeJS.ReadWriteStream}
 */
function constructProcessor(config, buildTarget, buildInfos, packageJson) {
    return new Transform({
        objectMode: true,

        /**
         * 
         * @param {import("vinyl")} chunk 
         */
        transform(chunk, encoding, callback) {
            if (VinylFile.isVinyl(chunk)) {
                const category =
                    chunk.isDirectory()
                        ? " DIR"
                        : chunk.isSymbolic()
                            ? "LINK"
                            : "FILE";

                console.log(category, chunk.base, chunk.relative);
            } else {
                console.log(chunk);
            }

            this.push(chunk);
            callback();
        }
    });
}
module.exports = constructProcessor;
