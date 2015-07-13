/*
 Copyright 2015 Province of British Columbia

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';

var gulp = require('gulp');
var es   = require('event-stream');
var md5 = require('MD5');
var ConsoleLogger  = require('consologger');
var consoleLog = new ConsoleLogger();

var using = require('gulp-using');
var concat = require('gulp-concat');

var targetFile = ['!**/bower_components/**/', '!public/bootstrap/**/',
                    '!**/gulpfile.js', '!public/js/**/*.*',
                    'public/**/*.html', 'public/**/*.js', 'app/**/*.js','config/**/*.json'];

var licenseFile = 'copyright-apache2.txt';

var htmlFileSuffix = [];
htmlFileSuffix.push('.html');
htmlFileSuffix.push('.htm');

var jsFileSuffix = [];
jsFileSuffix.push('.js','.json');

(function(){
    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

})();

function getArg(key) {
    var index = process.argv.indexOf(key);
    var next = process.argv[index + 1];
    return (index < 0) ? null : (!next || next[0] === "-") ? true : next;
}

function isFileType(fileTypeArray, fileName){
    var found = false;
    for(var i = fileTypeArray.length -1; i >= 0 && !found; i--){
        if(fileName.endsWith(fileTypeArray[i])){
            found = true;
        }
    }
    return found;
}

function isHtmlFile(filename){
    return isFileType(htmlFileSuffix, filename);
}

function isJsFile(filename){
    return isFileType(jsFileSuffix,filename);
}

function getCommentedLicenseTxt(licenseTxt, filename){
    var result = "";
    if(isHtmlFile(filename)){
        result += '<!--';
        result += '\n';
        result += licenseTxt.trim();
        result += '\n';
        result += '-->';
        result += '\n';

    }else if(isJsFile(filename)){
        result += '/*';
        result += '\n';
        result += licenseTxt.trim();
        result += '\n';
        result += '*/';
        result += '\n';
    }
    return result;
}

// insert license at the top of the file
function insertLicense(originalFileText, filename){
    var commentedLcTxt =  getCommentedLicenseTxt(lcStat.licenseTxt,filename);
    return commentedLcTxt +=originalFileText;
}

function lcStatFactory(){
    var stat = {
        licenseTxt: '',
        lc_checksum: '',
        numOfLines: 0
    }
    return stat;
}

var lcStat = lcStatFactory();
var doUpdate = '';


function selectiveUpdate(fsStream, callback){
    if(doUpdate){
        console.log("Insert license text to this file: " + fsStream.path + ".");
        callback(null, fsStream);
    }else{
        callback();
    }
}

gulp.task('get-args', function(){
    doUpdate = getArg("--update")
    console.log("--update param is: " + doUpdate);
});

gulp.task('license-stat', function(){

    // set buffer to false so that data.contents will be a stream
    return gulp.src(licenseFile, {buffer: false})
        .pipe(es.map(function(data, cb){
            cb(null,data.contents);
        }))
        .pipe(es.map(function(fsStream, callback){
            fsStream.on('data', function(data){
                var chunk = data.toString();

                var len = chunk.split('\n').length;
                lcStat.licenseTxt += chunk.trim();
                lcStat.numOfLines = lcStat.numOfLines + len;

                callback();
            });
            fsStream.on('end', function(){
                lcStat.lc_checksum = md5(lcStat.licenseTxt.trim());
                //console.log("license text checksum is: " + lcStat.lc_checksum);
                //console.log("line count in license file: " + lcStat.numOfLines);
                //console.log("license text: " + lcStat.licenseTxt);
                callback(null, lcStat);
            })
        }))
        ;
});


gulp.task('default', ['license-stat', 'get-args'], function(){
    return gulp.src(targetFile, {buffer:true})
        .pipe(es.map(
            function(data, callback){
                // data is a stream of vinyl files https://github.com/wearefractal/vinyl
                if(data.stat.isDirectory()){
                    console.log("Directory found: " + data.path);
                    callback(); // drop the data, not sending it down the pipe.
                }else{
                    // passing the vinyl file right down the pipe
                    callback(null, data);
                }
            }
        ))
        .pipe(es.map(function(fsStream, callback){
            //var found = true;
            var chunk = fsStream.contents.toString().trim();

            var file_path = fsStream.path;

            var regex_exp = null;
            if(isHtmlFile(file_path)){
                //regex_exp = /<!--((.|\n)^\[*?)-->.*/;
                // we are looking for comment before html tag
                regex_exp = /^<!--((.|\n|\r)*?)-->/;
            }else if(isJsFile(file_path)) {
                regex_exp = /^\s*\/\*((.|\n|\r)*?)\*\//;
            }

            if(regex_exp){
                var match_array = regex_exp.exec(chunk);
                if(match_array !=null && match_array.length>0){

                    var capturedLc = match_array[1].trim();

                    var cs = md5(capturedLc);
                    if(cs === lcStat.lc_checksum){
                        // This file already have a licensing term text that matches
                        // the content in the standard licences file.
                        consoleLog.white("Found standard license text this file: " + file_path).print() + ".";
                        callback();
                    }else{
                        consoleLog.red("Non-standard license text found in this file: " + file_path).print();

                        if(!doUpdate){
                            consoleLog.red.bold("Run with --update flag to update or insert license text to this file.").print();
                            console.log("----------------------------------------------------------------------------");
                        }

                        //consoleLog.red(capturedLc).print();
                        /*
                         The first comment section on top of the file does not match
                         with the standard license text. We will replace it with standard
                         license text.

                         Important condition:
                         The first comment section of top of the file must be standard license
                         text, otherwise it will be replaced.
                          */
                        if(doUpdate){
                            //console.log("Updating this file with license text. " + file_path);
                            //console.log();
                            //console.log("Entire file content before replacement: ");
                            //console.log(chunk);
                            //console.log();
                            var newChunk = chunk.replace(regex_exp,
                                getCommentedLicenseTxt(lcStat.licenseTxt,file_path));
                            //console.log();
                            //console.log("Entire file content after replacement: ");
                            //console.log(newChunk);
                            //console.log();

                            fsStream.contents = new Buffer(newChunk);
                        }

                        selectiveUpdate(fsStream, callback);
                    }
                }
                else{
                    consoleLog.bold.red("License text not found in this file: " + file_path).print();

                    if(!doUpdate){
                        consoleLog.red.bold("Run with --update flag to update or insert license text to this file.").print();
                        console.log("----------------------------------------------------------------------------");
                    }

                    if(doUpdate){
                        //console.log("Adding license text to this file: " + file_path);
                        var newText = insertLicense(chunk, file_path);
                        fsStream.contents = new Buffer(newText);
                    }

                    selectiveUpdate(fsStream, callback);
                }
            }else{
                // drop the stream if it is a file type we are currently not handling.
                callback();
            }
        }))
        .pipe(
            gulp.dest(function(dataPack){

                console.log("Writing to directory: " + dataPack.base);
                return dataPack.base;
            })
        )
        ;

});