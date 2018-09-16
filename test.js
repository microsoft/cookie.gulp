const gulp = require("gulp");
const vinyl = require("vinyl");
const { Transform, PassThrough } = require("stream");

const subStream = new Transform({
    objectMode: true,
    transform(chunck, encoding, callback) {
        console.log("subStream", chunck.path);
        try {
            this.push(chunck);
            console.log("subStream", "pushed");
        } catch (err) {
            console.log("subStream", err);
        }
        callback();
    }
});

const childStream = new Transform({
    objectMode: true,
    transform(chunck, encoding, callback) {
        try {
            this.push(chunck);
            console.log("childStream", "pushed");
        } catch (err) {
            console.log("childStream", err);
        }
        callback();
    }
});

function chain(stream1, stream2) {
    var proxy = new Transform({
        objectMode: true,
        transform(chunck, encoding, callback) {
            stream1.push(chunck);
            console.log("Proxy", "Pushed", chunck.path);
            callback();
        }
    });

    stream1.pipe(stream2).pipe(new Transform({
        objectMode: true,
        transform(chunck, encoding, callback) {
            proxy.push(chunck, encoding);
            callback();
        }
    }))

    return proxy;
}

// gulp.src("src/**/*.json", { dot: true }).pipe().pipe(new Transform({
//     objectMode: true,
//     transform(chunk, encoding, callback) {
//         console.log(chunk.inspect());
//         this.push(chunk);
//         callback();
//     }
// }))
const file = new vinyl({ path: "D:/Sources/cookie.gulp/test.js" });
console.log(file.isNull());
