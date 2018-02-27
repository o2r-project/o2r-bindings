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
const fn = require('./generalFunctions');

let bindings = {};

bindings.start = (conf) => {
    return new Promise((resolve, reject) => {
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        debug('Receiving data to create bindings');
        app.post('/api/v1/bindings', function(req, res) {
            debug('Received the following data: %s', req.body.id);
            switch (req.body.purpose) {
                case 'showFigureCode':
                    bindings.showCode(req.body);
                    break;
                case 'showResultCode':
                    bindings.showCode(req.body);
                    break;
                default:
                    break;
            }
            res.send({
                callback: 'ok',
                temp: 'bla',
                data: req.body.id});
        });
        let bindingsListen = app.listen(conf.port, () => {
            debug('Bindings server listening on port %s', conf.port);
            resolve(bindingsListen);
        });
    });
};

bindings.showCode = function(binding) {
    debug('Start creating the binding %s for the result %s', binding.purpose, binding.result);
    let fileContent = fn.readRmarkdown(binding.id, binding.mainfile);
    let codeLines = fn.handleCodeLines(binding.codeLines);
    let code = fn.extractCode(fileContent, codeLines);
    fn.saveResult(code, binding.id, binding.result);
    fn.modifyMainfile(binding, fileContent);
};

module.exports = bindings;
