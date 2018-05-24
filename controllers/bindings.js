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

const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('bindings');
const rscript = require('r-script');
const path = require('path');
const net = require('net');
const fn = require('./generalFunctions');

let bindings = {};

bindings.start = (conf) => {
    return new Promise((resolve, reject) => {
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        debug('Start service to create bindings');
        app.post('/api/v1/bindings/inspectCodeDataFigure', function(req, res) {
            bindings.showFigureDataCode(req.body);
            res.send({
                callback: 'ok',
                data: req.body});
        });
        app.post('/api/v1/bindings/inspectCodeDataNumber', function(req, res) {
            // ...
        });
        app.post('/api/v1/bindings/manipulateFigure', function(req, res) {
            bindings.manipulateFigure(req.body, res);
        });
        app.post('/api/v1/bindings/manipulateNumber', function(req, res) {
            // ...
        });
        app.post('/api/v1/bindings/runPlumberService', function(req, res) {
            res.send({
                callback: 'ok',
                data: req.body});
            debug('Start running plumber service for binding %s', req.body.id);
            bindings.runR(req.body);
        });
        let bindingsListen = app.listen(conf.port, () => {
            debug('Bindings server listening on port %s', conf.port);
            resolve(bindingsListen);
        });
    });
};

bindings.manipulateFigure = function(binding, response) {
    debug('Start creating binding. Purpose: %s, result: %s, compendium: %s',
                binding.purpose, binding.result.value, binding.id);
    let fileContent = fn.readRmarkdown(binding.id, binding.code.file);
        fn.modifyMainfile(fileContent, binding.result, binding.code.file, binding.id);
        fileContent = fn.replaceVariable(fileContent, binding.code.parameter);
    let codeLines = fn.handleCodeLines(binding.code.codeLines);
    let extractedCode = fn.extractCode(fileContent, codeLines);
    let wrappedCode = fn.wrapCode(extractedCode, binding.id, binding.result.value, binding.code.parameter.val);
    fn.saveResult(wrappedCode, binding.id, binding.result.value.replace(/\s/g, '').toLowerCase());
    fn.createRunFile(binding.id, binding.result.value.replace(/\s/g, '').toLowerCase(), binding.port);
    binding.codesnippet = binding.result.value.replace(/\s/g, '').toLowerCase() + '.R';
    response.send({
        callback: 'ok',
        data: binding});
};

bindings.showFigureDataCode = function(binding) {
    debug('Start creating the binding %s for the result %s',
        binding.purpose, binding.figure);
    let fileContent = fn.readRmarkdown(binding.id, binding.mainfile);
    let codeLines = fn.handleCodeLines(binding.codeLines);
    let extractedCode = fn.extractCode(fileContent, codeLines);
    fn.saveResult(extractedCode, binding.id, binding.figure);
    let dataContent = fn.readCsv(binding.id, binding.dataset);
    let extractedData = fn.extractData(dataContent, bindings.dataset);
    fn.saveDatasets(extractedCode, binding.id,
        binding.figure.replace(/\s/g, '').toLowerCase());
    // fn.modifyMainfile(binding, fileContent);
};

bindings.runR = function(binding) {
    let server = net.createServer(function(socket) {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });
    
        server.listen(binding.port, 'localhost');
        server.on('error', function (e) {
            debug("port %s is not free", binding.port);
        });
        server.on('listening', function (e) {
            server.close();
            debug("port %s is free", binding.port);
            let filepath = path.join('tmp', 'o2r', 'compendium', binding.id, binding.result.value.replace(/\s/g, '').toLowerCase() + 'run.R');
            let run = rscript(filepath)
                .call(function(err, d) {
                    debug('Started service: %s', binding.result.value);
                });
        });
};

module.exports = bindings;
