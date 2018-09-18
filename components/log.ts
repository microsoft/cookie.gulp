//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import { Transform } from "stream";
import * as VinylFile from "vinyl";

export = () => new Transform({
    objectMode: true,

    transform(chunk: VinylFile, encoding, callback): void {
        if (VinylFile.isVinyl(chunk)) {
            const category =
                chunk.isDirectory()
                    ? " DIR"
                    : chunk.isSymbolic()
                        ? "LINK"
                        : "FILE";

            console.log(category, chunk.path);
        } else {
            console.log(chunk);
        }

        this.push(chunk);
        callback();
    }
});
