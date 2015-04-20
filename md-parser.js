
'use strict';

var gulp = require('gulp');
var es   = require('event-stream');
var md5 = require('MD5');
var ConsoleLogger  = require('consologger');
var logger = new ConsoleLogger();

var using = require('gulp-using');
var concat = require('gulp-concat');
var fs = require('fs');

var inspect = require('util').inspect;

var targetFile = './test-md-simple.txt';
//var targetFile = './test-md-advanced.txt';

/**
 * To run this script, use this command:
 * gulp --gulpfile md-parser.js
 */
gulp.task('parse', function() {
    gulp.src(targetFile, {buffer: false})
        .pipe(es.map(function(fsStream, callback){
                callback(null, fsStream.contents);
            }))
        .pipe(es.map(function(fsStream, callback){
            fsStream.on('data', function(chunk){
                var line = chunk.toString();
                var linesArray = line.split(/[\n\r]/);
                console.log("linesArray size: " + linesArray.length);

                for(var i=0; i<linesArray.length; i++){

                    var regRowStart = /.*(<!-{2,}?.*\[\s*row\s+?start\s*\].*-{2,}?>).*/i;
                    var regRowStart2 = /.*(\[\s*row\s+?start\s*\]).*/i;

                    var regRowEnd = /.*(<!-{2,}?.*\[\s*row\s+?end\s*\].*-{2,}?>).*/i;
                    var regRowEnd2 = /.*(\[\s*row\s+?end\s*\]).*/i;

                    if(regRowStart.test(linesArray[i])){
                        console.log("Found starting row: " + linesArray[i]);
                    }

                    if(regRowStart2.test(linesArray[i])){
                        console.log("Found alternative starting row: " + linesArray[i]);
                    }

                    if(regRowEnd.test(linesArray[i])){
                        console.log("Found ending row: " + linesArray[i]);
                    }

                    if(regRowEnd2.test(linesArray[i])){
                        console.log("Found alternative end row: " + linesArray[i]);
                    }

                    console.log("new line: " + linesArray[i]);
                    callback(null, linesArray[i]);
                }
            })
        }))
        .pipe(fs.createWriteStream('result.txt'));




});

gulp.task('default', ['parse']);