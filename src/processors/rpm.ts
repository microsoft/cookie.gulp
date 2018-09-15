//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

import * as gulp from "gulp";
import { PassThrough } from "stream";
import * as semver from "semver";

import * as log from "../log";
import * as globUtils from "../glob-utils";
import * as wix from "../components/wix/wix";
import { chain } from "../steams-utils";