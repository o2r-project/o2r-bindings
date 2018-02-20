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
const fs = require('fs');

let bindings = {};

bindings.start = (conf) => {
    return new Promise((resolve, reject) => {
        const app = express();
        app.use(bodyParser.urlencoded({extended: true}));
        debug('Receiving data to create bindings');
        app.post('/api/v1/bindings', function(req, res) {
            switch (req.body.purpose) {
                case 'showFigureCode':
                    saveRmarkdown(readRmarkdown(req.body.id, req.body.mainfile));
                    res.send({
                        callback: 'ok'});
                    break;
                default:
                    break;
            }
        });
        let bindingsListen = app.listen(conf.port, () => {
            debug('Bindings server listening on port %s', conf.port);
            resolve(bindingsListen);
        });
    });
};

let readRmarkdown = function( compendiumId, mainfile ) {
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

let saveRmarkdown = function(data) {
    fs.writeFile(__dirname + '/testdata/paper_interactive.Rmd',
                        data, 'utf8', function(err) {
        debug(err);
    } );
};

module.exports = bindings;
