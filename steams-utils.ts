//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Readable, Writable, Transform } from "stream";

export function chain(...streams: Array<Readable & Writable | NodeJS.ReadWriteStream>): Readable & Writable {
    if (!Array.isArray(streams) || streams.length <= 0) {
        throw new Error("At least one stream must be provided.");
    }

    let lastStream: Readable & Writable | NodeJS.ReadWriteStream;

    for (const stream of streams) {
        lastStream = lastStream ? lastStream.pipe(stream) : stream;
    }

    const headStream = streams[0];
    const proxy = new Transform({
        objectMode: true,
        transform(chunk, encoding, callback): void {
            headStream.write(chunk);
            callback();
        }
    });

    lastStream.pipe(new Writable({
        objectMode: true,
        write(chunk, encoding, callback): void {
            proxy.push(chunk);
            callback();
        }
    }));

    return proxy;
}
