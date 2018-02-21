/*
 * (C) Copyright 2017 o2r project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

'use strict';

const fs = require('fs');
const debug = require('debug')('bindings');

let fn = {};

fn.modifyMainfile = function(binding, fileContent) {
    if (binding.lineOfResult) {
        let splitFileContent = fileContent.split('\n');
        let lor = binding.lineOfResult-1;
            splitFileContent[lor] = splitFileContent[lor].replace(new RegExp(binding.result), '__' + binding.result + '__');
        let newContent = '';
            splitFileContent.forEach(function(elem) {
                newContent = newContent + elem + '\n';
            });
        fn.saveRmarkdown(newContent, binding.mainfile);
    } else {
        fileContent = fileContent.replace(new RegExp(binding.result, 'g'), '__' + binding.result + '__');
        fn.saveRmarkdown(fileContent, binding.id, binding.mainfile);
    }
};

fn.extractCode = function(fileContent, codeLines) {
    let newContent = '---' + fileContent.split('---')[1] + '---\n' + '```{r}';
    let splitFileContent = fileContent.split('\n');
    codeLines.forEach(function(elem) {
        newContent = newContent + '\n' + splitFileContent[elem] + '\n';
    });
    newContent += '```';
    return newContent;
};

fn.handleCodeLines = function(lines) {
    let codeLines = [];
    lines.forEach(function(elem) {
        if (elem.indexOf('-') > -1) {
            let range = elem.split('-');
            for (let i = range[0]; i <= range[1]; i++) {
                codeLines.push(Number(i)-1); // -1 is required as the code lines from the front end start counting at 1.
            };
        } else {
            codeLines.push(Number(elem)-1);
        }
    });
    return codeLines.sort();
};

fn.readRmarkdown = function(compendiumId, mainfile) {
    if ( !compendiumId | !mainfile ) {
        throw new Error('File does not exist.');
    }
    let paper = __dirname + '/' + compendiumId + '/' + mainfile;
    fs.exists(paper, function(ex) {
        if (!ex) {
            throw new Error('File does not exist.');
        }
    });
    return fs.readFileSync(paper, 'utf8');
};

fn.saveResult = function(data, id, fileName) {
    fileName = fileName.replace(' ', '');
    fileName = fileName.replace('.', '_');
    fileName = fileName.replace(',', '_');
    if (!fs.existsSync(__dirname + '/' + id + '/bindings')) {
        fs.mkdirSync(__dirname + '/' + id + '/bindings');
    }
    fileName = 'bindings/' + fileName + '.Rmd';
    fn.saveRmarkdown(data, id, fileName);
};

fn.saveRmarkdown = function(data, id, fileName) {
    let dir = __dirname + '/' + id + '/' + fileName;
    fs.writeFile(dir, data, 'utf8', function(err) {
        debug(err);
    });
};

module.exports = fn;
