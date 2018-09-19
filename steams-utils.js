"use strict";
//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
function chain(...streams) {
    if (!Array.isArray(streams) || streams.length <= 0) {
        throw new Error("At least one stream must be provided.");
    }
    let lastStream;
    for (const stream of streams) {
        lastStream = lastStream ? lastStream.pipe(stream) : stream;
    }
    const headStream = streams[0];
    const proxy = new stream_1.Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            headStream.write(chunk);
            callback();
        }
    });
    lastStream.pipe(new stream_1.Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            proxy.push(chunk);
            callback();
        }
    }));
    return proxy;
}
exports.chain = chain;
//# sourceMappingURL=steams-utils.js.map