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
(function(){

    var bootstrapExtensions = function(converter){
        var row;
        /**
         * Represents content enclosed between column tags
         * @constructor
         */
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
                    colWidth = Math.floor(12/colCount);
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

        /**
         * Regular markdown content not enclosed in column tags
         */
        function MDContent(){
            this.lines = [];
            this.toString = function(){
                return concatLines(this.lines);
            }

            this.isColumn = function(){
                return false;
            }

        }

        /**
         * Content enclosed in column tags
         */
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
                    colDiv += '\t <!-- no content was specified in this column. -->' + '\r\n';
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
            if(!!result.trim()){
                return result;
            }else{
                return '';
            }
        };


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

        function generateColumns(text, htmlOutput){
            if(testRowStart(text)) {// row start tag detected
                //console.log("Row start tag discovered.")
                row = new Row();
                row.addSection(new MDContent());

            }else if(testColStart(text)){
                //console.log("Col start tag discovered.")
                row.addSection(new Col());
            }else if(testColEnd(text)){
                //console.log("Col end tag discovered.")
                row.addSection(new MDContent());
            }else if(testRowEnd(text)){
                //console.log("Row end tag discovered.")
                row.addSection(new MDContent);
                htmlOutput.push(row.toString());
                row = null;
            }else if(!!row){
                row.addLine(text);
            }else{
                htmlOutput.push(text);
            }
        }

        function makeHTMLColumns(text){
            if(!!text && !!text.trim()){
                var htmlOutput = [];
                //console.log('Processing text for markdown column extensions.');

                var lines = text.split(/[\n\r]/);
                for(var i=0; i<lines.length; i++){
                    generateColumns(lines[i], htmlOutput);
                }
                return prepareOutput(htmlOutput);
            }else{
                return text;
            }
        }

        function prepareOutput(output){
            var result = '<!-- devx markdown enhancement generated content START -->';
            result += '\r\n';

            for(var j=0; j<output.length; j++){
                result += output[j];
            }
            result += '\r\n';
            result += '<!-- devx markdown enhancement generated content END -->';
            result += '\r\n';

            return result;
        }

            return [
                // Replace escaped @ symbols
                { type: 'lang', filter: function(text) {
                    return text.replace(/\\@/, '@');
                }},
                { type: 'lang', filter: function(text) {
                    return text.replace(/<!---/g, '<!--');
                }},
                { type: 'lang', filter: function(text) {
                    return text.replace(/--->/g, '-->');
                }},
                { type: 'lang', filter: function(text) {
                    return text.replace(/!\[(.*)\]\((.*)\)/, "<img src=\'$2\' class=\'img-responsive\' alt=\'$1\' />");
                }},
                { type: 'output', filter: function(text) {
                    return makeHTMLColumns(text);
                }}
            ];
    }

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.btexts = bootstrapExtensions; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = bootstrapExtensions;
})();