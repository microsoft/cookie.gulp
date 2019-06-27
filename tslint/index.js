//-----------------------------------------------------------------------------
// Copyright (c) 2018 Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------
"use strict";

exports.tslint = require("./tslint");

exports.processes = [
    {processorName: "tslint", processor: exports.tslint},
];

require("cookie.gulp").processor("tslint", exports.tslint);
