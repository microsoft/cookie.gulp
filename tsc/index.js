//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

exports.compile = require("./tsc").compile;
exports.typescript = require("./typescript");

require("cookie.gulp").processor("typescript", exports.typescript);
