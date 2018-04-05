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
const fs = require('fs')

const fn = require('./generalFunctions');


let bindings = {};

bindings.start = (conf) => {
    return new Promise((resolve, reject) => {
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        debug('Receiving data to create bindings');
        app.post('/api/v1/bindings/discover/number', function(req, res) {
            res.send({
                callback: 'ok',
                data: req.body});
        });
        app.post('/api/v1/bindings/discover/figure', function(req, res) {
            res.send({
                callback: 'ok',
                data: req.body});
        });
        app.post('/api/v1/bindings/inspect/paperDataCode', function(req, res) {
            res.send({
                callback: 'ok',
                data: req.body});
        });
        app.post('/api/v1/bindings/inspect/numberDataCode', function(req, res) {
            res.send({
                callback: 'ok',
                data: req.body});
        });
        app.post('/api/v1/bindings/inspect/figureDataCode', function(req, res) {
            bindings.showFigureDataCode(req.body);
            res.send({
                callback: 'ok',
                data: req.body});
        });
        app.post('/api/v1/bindings/manipulate/figure', function(req, res) {
            bindings.manipulateFigure(req.body, res);
        });
        app.post('/api/v1/bindings/manipulate/run', function(req, res) {
            debug('Start running plumber service for %s', req.body.id);
            bindings.runR(req.body);
            res.send({
                callback: 'ok',
                data: req.body});
        });
        let bindingsListen = app.listen(conf.port, () => {
            debug('Bindings server listening on port %s', conf.port);
            resolve(bindingsListen);
        });
    });
};

bindings.manipulateFigure = function(binding, response) {
    debug('Start creating the binding %s for the result %s for the compendium %s', binding.purpose, binding.figure, binding.id);
    let fileContent = fn.readRmarkdown(binding.id, binding.mainfile);
        fileContent = fn.replaceVariable(fileContent, binding.variable);
    let codeLines = fn.handleCodeLines(binding.codeLines);
    let extractedCode = fn.extractCode(fileContent, codeLines);
    let wrappedCode = fn.wrapCode(extractedCode, binding.id, binding.figure);
    fn.saveResult(wrappedCode, binding.id, binding.figure.replace(/\s/g, '').toLowerCase());
    fn.createRunFile(binding.id, binding.figure.replace(/\s/g, '').toLowerCase());
    binding.codesnippet = binding.figure.replace(/\s/g, '').toLowerCase() + '.R';
    response.send({
        callback: 'ok',
        data: binding});
};

bindings.showFigureDataCode = function(binding) {
    debug('Start creating the binding %s for the result %s', binding.purpose, binding.figure);
    let fileContent = fn.readRmarkdown(binding.id, binding.mainfile);
    let codeLines = fn.handleCodeLines(binding.codeLines);
    let extractedCode = fn.extractCode(fileContent, codeLines);
    fn.saveResult(extractedCode, binding.id, binding.figure);
    let dataContent = fn.readCsv(binding.id, binding.dataset);
    let extractedData = fn.extractData(dataContent, bindings.dataset);
    fn.saveDatasets(extractedCode, binding.id, binding.figure.replace(/\s/g, '').toLowerCase());
    //fn.modifyMainfile(binding, fileContent);
};

bindings.runR = function(binding) {
    debug('Start running R script %s', binding.id);
    let run = rscript(path.join(path.join('tmp', 'o2r', 'compendium', binding.id, binding.figure.replace(/\s/g, '').toLowerCase() + 'run.R')))
        .data(binding.id)
        .callSync();
};

module.exports = bindings;
