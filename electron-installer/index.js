//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

exports.pack = require("./pack");

exports.deb = require("./deb");
exports.rpm = require("./rpm");
exports.zip = require("./zip");

(() => {
    const cookie = require("cookie.gulp");

    cookie.processor("electron/pack", exports.pack);
    cookie.processor("electron/deb", exports.deb);
    cookie.processor("electron/rpm", exports.rpm);
    cookie.processor("electron/zip", exports.zip);
})();
