//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

declare module "vinyl" {
    import * as fs from "fs";

    interface IVinylConstructorOptions {
        /** The current working directory of the file. */
        cwd?: string;

        /** Used for calculating the relative property. This is typically where a glob starts. */
        base?: string;

        /** The full path to the file. */
        path?: string;

        /** 
         * Stores the path history. If options.path and options.history are both passed, options.path is appended to options.history. 
         * All options.history paths are normalized by the file.path setter.
         */
        history?: Array<string>;

        /**
         * The result of an fs.stat call. This is how you mark the file as a directory or symbolic link. 
         * See isDirectory(), isSymbolic() and fs.Stats for more information.
         */
        stat?: fs.Stats;
        
        /**
         * The contents of the file. If options.contents is a ReadableStream, it is wrapped in a cloneable-readable stream.
         */
        contents?: ReadableStream | Buffer;

        /**
         * Any other option properties will be directly assigned to the new Vinyl object.
         */
        [property: string]: any;
    }

    class Vinyl {
        
        /**
         * Gets and sets the contents of the file. If set to a ReadableStream, it is wrapped in a cloneable-readable stream.
         * 
         * Throws when set to any value other than a ReadableStream, a Buffer or null.
         */
        public contents: ReadableStream | Buffer | null;

        /**
         * Gets and sets current working directory. Will always be normalized and have trailing separators removed.
         * 
         * Throws when set to any value other than non-empty strings.
         */
        public cwd: string;

        /**
         * Gets and sets base directory. Used for relative pathing (typically where a glob starts). When null or undefined, 
         * it simply proxies the file.cwd property. Will always be normalized and have trailing separators removed.
         * 
         * Throws when set to any value other than non-empty strings or null/undefined.
         */
        public base: string;

        /**
         * Gets and sets the absolute pathname string or undefined. Setting to a different value appends the new path to file.history. 
         * If set to the same value as the current path, it is ignored. All new values are normalized and have trailing separators removed.
         * 
         * Throws when set to any value other than a string.
         */
        public path: string;

        /**
         * Array of file.path values the Vinyl object has had, from file.history[0] (original) through file.history[file.history.length - 1] (current). 
         * file.history and its elements should normally be treated as read-only and only altered indirectly by setting file.path
         */
        public readonly history: Array<string>;

        /**
         * Gets the result of path.relative(file.base, file.path).
         * 
         * Throws when set or when file.path is not set.
         */
        public readonly relative: string;

        /**
         * Gets and sets the dirname of file.path. Will always be normalized and have trailing separators removed.
         * 
         * Throws when file.path is not set.
         */
        public direname: string;

        /**
         * Gets and sets the basename of file.path.
         * 
         * Throws when file.path is not set.
         */
        public basename: string;

        /**
         * Gets and sets stem (filename without suffix) of file.path.
         * 
         * Throws when file.path is not set.
         */
        public stem: string;

        /**
         * Gets and sets extname of file.path.
         * 
         * Throws when file.path is not set.
         */
        public extname: string;

        /**
         * Gets and sets the path where the file points to if it's a symbolic link. Will always be normalized and have trailing separators removed.
         * 
         * Throws when set to any value other than a string.
         */
        public symlink: string;

        constructor(options: IVinylConstructorOptions);

        /**
         * Returns true if the file contents are a Buffer, otherwise false
         */
        public isBuffer(): boolean;

        /**
         * Returns true if the file contents are a Stream, otherwise false.
         */
        public isStream(): boolean;

        /**
         * Returns true if the file contents are null, otherwise false.
         */
        public isNull(): boolean;

        /**
         * Returns true if the file represents a directory, otherwise false.
         * 
         * A file is considered a directory when:
         * * isNull() is true.
         * * stat is an object.
         * * stat.isDirectory() returns true.
         */
        public isDirectory(): boolean;

        /**
         * Returns true if the file represents a directory, otherwise false.
         * 
         * A file is considered a directory when:
         * * isNull() is true.
         * * stat is an object.
         * * stat.isSymbolicLink() returns true.
         */
        public isSymbolic(): boolean;

        /**
         * Returns a new Vinyl object with all attributes cloned.
         * 
         * By default custom attributes are cloned deeply.
         * 
         * If options or options.deep is false, custom attributes will not be cloned deeply.
         * 
         * If file.contents is a Buffer and options.contents is false, the Buffer reference will be reused instead of copied.
         */
        public clone(options: { deep: boolean }): Vinyl;

        /**
         * Returns a formatted-string interpretation of the Vinyl object. Automatically called by node's console.log().
         */
        public inspect(): string;

        /**
         * Checking if an object is a Vinyl file. Use this method instead of instanceof. 
         * @param {*} obj The object to check.
         * @returns {boolean} Returns true if it is a Vinyl file, otherwise returns false.
         */
        public static isVinyl(obj: any): boolean;

        /**
         * Used by Vinyl when setting values inside the constructor or when copying properties in file.clone().
         * @param property The name of the property.
         * @returns {boolean} Returns true if the property is not used internally, otherwise returns false.
         */
        public static isCustomProp(property: string): boolean;
    }

    export = Vinyl;
}