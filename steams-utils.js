//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const { Transform, Writable } = require("stream");

/**
 * Create a single Transform to wrap a stream chain pipeline.
 * @param  {...NodeJS.ReadWriteStream} streams
 * @returns {NodeJS.ReadWriteStream}
 */
function chain(...streams) {
    if (!Array.isArray(streams) || streams.length <= 0) {
        throw new Error("At least one stream must be provided.");
    }

    /** @type {NodeJS.ReadWriteStream} */
    let lastStream;

    for (const stream of streams) {
        lastStream = lastStream ? lastStream.pipe(stream) : stream;
    }

    const headStream = streams[0];
    const proxy = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            headStream.write(chunk);
            callback();
        }
    });

    lastStream.pipe(new Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            proxy.push(chunk);
            callback();
        }
    }));

    return proxy;
}
exports.chain = chain;
