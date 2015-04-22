
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

//var targetFile = './test-md-simple.txt';
var targetFile = './test-md-advanced.txt';


function Row(){
    var contents = [];

    this.toString = function(){
        var colCount = 0;
        var colWidth = 0;

        for(var i=0; i<contents.length; i++){
            if(contents[i].isColumn()){
                colCount++;
            }
        }

        if(!!colCount){
            console.log("column count: " + colCount);
            colWidth = Math.floor(12/colCount);
            console.log("col width: " + colWidth);
        }

        if(contents.length>0){
            var rowDiv = '\r\n';
            rowDiv += '<div class=\'row\'>' + '<!--row starts-->' + '\r\n';

            for(var i=0; i<contents.length; i++){
                rowDiv += contents[i].toString(colWidth);
                //if(i<contents.length-1){
                //    rowDiv += '\r\n';
                //}
            }
            rowDiv += '\r\n</div>' + '<!-- row ends -->';

            return rowDiv;
        }else{
            return '';
        }
    }

    this.addLine = function(str){
        if(!!str && !!str.trim()){
            contents[contents.length-1].lines.push(str);
        }
    }

    this.addSection = function(obj){
        contents.push(obj);
    }

    this.currentSectionType = function(){
        if(contents.length >0){
            return typeof contents[contents.length-1];
        }else{
            return null;
        }
    }

    this.isColumn = function(){
        return false;
    }

}

function MDContent(){
    this.lines = [];
    this.toString = function(){
        return concatLines(this.lines);
    }

    this.isColumn = function(){
        return false;
    }

}

function Col(){
    this.lines = [];
    this.toString = function(colWidth){
        if(this.lines.length>0){
            var colDiv = '\t'+ '<div class=\'col-md-' + colWidth + '\'>'
            //var colDiv = '\t'+ '<div class=\'col-md-2\'>'

            colDiv += '\t <!-- column starts-->' + '\r\n';
            colDiv += concatLines(this.lines);
            colDiv += '\t' + '</div> <!-- column ends -->';

            return colDiv;
        }else{
            var colDiv = '\r\n' + '\t'+ '<div class=\'col-md-' + colWidth + '\'>'

            colDiv += '\t <!-- column starts-->' + '\r\n';
            colDiv += '\t <!-- no contend defined in this column -->' + '\r\n';
            colDiv += '\t' + '</div> <!-- column ends -->\r\n';

            return colDiv;
        }
    }

    this.isColumn = function(){
        return true;
    }
}

function concatLines(lines){
    var result = '';
    for(var i=0; i<lines.length; i++){
        result += '\t' + lines[i];
        result += '\r\n';
    }
    console.log('Concatination result: ' + result);
    if(!!result.trim()){
        return result;
    }else{
        return '';
    }
};

(function(){
    Col.prototype.concatLines = concatLines;
    MDContent.prototype.concatLines = concatLines;

})();

function test(regex1, regex2, line){
    if(!!line && !!line.trim()){
        return (regex1.test(line) | regex2.test(line));
    }else{
        return false;
    }
}

function testRowStart(line){
    var regRowStart = /.*(<!-{2,}?.*\[\s*row\s+?start\s*\].*-{2,}?>).*/i;
    var regRowStart2 = /.*(\[\s*row\s+?start\s*\]).*/i;

    return test(regRowStart, regRowStart2, line);
}


function testRowEnd(line){
    var regRowEnd = /.*(<!-{2,}?.*\[\s*row\s+?end\s*\].*-{2,}?>).*/i;
    var regRowEnd2 = /.*(\[\s*row\s+?end\s*\]).*/i;

    return test(regRowEnd, regRowEnd2, line);
}

function testColStart(line){
    var colStart = /.*(<!-{2,}?.*\[\s*col\s+?start\s*\].*-{2,}?>).*/i;
    var colStart2 = /.*(\[\s*col\s+?start\s*\]).*/i;

    return test(colStart, colStart2, line);
}

function testColEnd(line){
    var colEnd = /.*(<!-{2,}?.*\[\s*col\s+?end\s*\].*-{2,}?>).*/i;
    var colEnd2 = /.*(\[\s*col\s+?end\s*\]).*/i;

    return test(colEnd, colEnd2, line);
}
var row;
var output = [];

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
                var inputLine = chunk.toString();
                var linesArray = inputLine.split(/[\n\r]/);
                console.log("linesArray size: " + linesArray.length);


                for(var i=0; i<linesArray.length; i++){

                    var line = linesArray[i];

                    if(testRowStart(line)) {// row start tag detected
                        console.log("Row start line: " + line);
                        row = new Row();
                        row.addSection(new MDContent());

                    }else if(testColStart(line)){
                        console.log("Col start line: " + line);
                        row.addSection(new Col());
                    }else if(testColEnd(line)){
                        console.log("Col end line: " + line);
                        row.addSection(new MDContent());
                    }else if(testRowEnd(line)){
                        console.log("Row end line: " + line);
                        row.addSection(new MDContent);
                        output.push(row.toString());
                        row = null;
                    }else if(!!row){
                        console.log("Line enclosed in a row: " + line);

                        row.addLine(line);
                    }else{
                        console.log("Line outside of a row: " + line);
                        output.push(line);
                    }
                }// end of for loop
                callback();
            });

            fsStream.on('end', function(){
                var result = '<!-- devx markdown enhancement generated content START -->';
                result += '\r\n';

                for(var j=0; j<output.length; j++){
                    result += output[j];
                }
                result += '\r\n';
                result += '<!-- devx markdown enhancement generated content END -->';
                result += '\r\n';

                console.log("Writing to file: ");
                console.log(result);
                callback(null, result);
            })
        }))
        .pipe(fs.createWriteStream('result.txt'));

});

gulp.task('default', ['parse']);