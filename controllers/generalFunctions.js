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
const path = require('path');

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
        fn.saveRmarkdown(newContent, binding.id, binding.mainfile);
    } else {
        fileContent = fileContent.replace(new RegExp(binding.result, 'g'), '__' + binding.result + '__');
        fn.saveRmarkdown(fileContent, binding.id, binding.mainfile);
    }
};

fn.extractCode = function(fileContent, codeLines) {
    let newContent = '';
    let splitFileContent = fileContent.split('\n');
    codeLines.forEach(function(elem) {
        newContent += splitFileContent[elem] + '\n';
    });
    return newContent;
};

fn.wrapCode = function(sourcecode, compendiumId, result, value) {
    let get = "#' @get /" + result.replace(/\s/g, '').toLowerCase() + '\n' +
                "#' @png \n" +
                'function(newValue){ \n';
    if (!isNaN(value)) {
        debug('Value %s is a number', value);
        get = get + 'newValue = as.numeric(newValue) \n';
    }
    let code = sourcecode.split('\n');
        code[code.length-2] = 'print(' + code[code.length-2] + ')';
    let newCode = '';
        code.forEach(function(elem) {
            newCode += elem + '\n';
        });
    let newContent = get + newCode + '}';
    return newContent;
};

fn.replaceVariable = function(code, variable) {
    debug('Replace by variable %s', variable);
    let newContent = code.replace(variable.text, variable.varName + ' = newValue');
    return newContent;
};

fn.handleCodeLines = function(lines) {
    let codeLines = [];
    lines.forEach(function(elem) {
        for (let i = elem.start; i <= elem.end; i++) {
            codeLines.push(Number(i)-1); // -1 is required as the code lines from the front end start counting at 1.
        };
    });
    return codeLines.sort(function(a, b) {
        return a-b;
    });
};

fn.readRmarkdown = function(compendiumId, mainfile) {
    debug('Read RMarkdown %s from compendium %s', mainfile, compendiumId);
    if ( !compendiumId | !mainfile ) {
        throw new Error('File does not exist.');
    }
    let paper = path.join('tmp', 'o2r', 'compendium', compendiumId, mainfile);
    fs.exists(paper, function(ex) {
        if (!ex) {
            debug('Cannot open file %s', paper);
            throw new Error('File does not exist.');
        }
    });
    return fs.readFileSync(paper, 'utf8');
};

fn.readCsv = function(compendiumId, datasets) {
    if ( !compendiumId | datasets ) {
        throw new Error('File does not exist.');
    }
    let datafile = path.join('tmp', 'o2r', 'compendium', compendiumId, datasets[0].file.split('/').pop());
};

fn.saveResult = function(data, compendiumId, fileName) {
    fileName = fileName.replace(' ', '');
    fileName = fileName.replace('.', '_');
    fileName = fileName.replace(',', '_');
    if (!fs.existsSync(path.join('tmp', 'o2r', 'compendium', compendiumId))) {
        fs.mkdirSync(path.join('tmp', 'o2r', 'compendium', compendiumId));
    }
    fileName = path.join(fileName + '.R');
    fn.saveRFile(data, compendiumId, fileName);
};

fn.createRunFile = function(compendiumId, result, port) {
    let content = 'library("plumber")' + '\n' +
                    'path = paste("/tmp/o2r/compendium/' + compendiumId + '/' + result + '.R", sep = "")\n' +
                    'r <- plumb(path)\n' +
                    'r$run(host = "0.0.0.0", port=' + port + ')';
    fn.saveRFile(content, compendiumId, result+'run.R');
};

fn.saveRFile = function(data, compendiumId, fileName) {
    let dir = path.join('tmp', 'o2r', 'compendium', compendiumId, fileName);
    fs.writeFile(dir, data, 'utf8', function(err) {
        debug(err);
    });
    debug('Saved result under the directory %s', dir);
};

module.exports = fn;
