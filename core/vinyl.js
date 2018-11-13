//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

const VinylFile = require("vinyl");
const fs = require("fs")

/**
 * Create a Vinyl File object.
 * @param {string} filePath,
 * @param {string} [base]
 * @returns {import("vinyl")}
 */
module.exports = (filePath, base) => {
    const stat = fs.statSync(filePath);

    return new VinylFile({
        path: filePath,
        base: base,
        stat: stat,
        contents: stat.isFile() ? fs.createReadStream(filePath) : undefined
    });
}