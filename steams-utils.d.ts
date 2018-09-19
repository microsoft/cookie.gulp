/// <reference types="node" />
import { Readable, Writable } from "stream";
export declare function chain(...streams: Array<Readable & Writable | NodeJS.ReadWriteStream>): Readable & Writable;
