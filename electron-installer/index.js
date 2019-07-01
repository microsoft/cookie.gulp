//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

exports.pack = require("./pack");

exports.deb = require("./deb");
exports.rpm = require("./rpm");
exports.zip = require("./zip");

exports.processes = [
    {processorName: "electron/pack", processor: exports.pack},
    {processorName: "electron/deb", processor: exports.deb},
    {processorName: "electron/rpm", processor: exports.rpm},
    {processorName: "electron/zip", processor: exports.zip},
];
