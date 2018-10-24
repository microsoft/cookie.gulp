//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

exports.heat = require("./heat");
exports.candle = require("./candle");
exports.light = require("./light");
exports.msi = require("./msi");

require("cookie.gulp").processor("msi", exports.msi);
