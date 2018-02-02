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
const debug = require('debug')('bindings:bindings')
const fs = require("fs");

var bindings = {};

bindings.start = (conf) => {
    
    return new Promise((resolve, reject) => {
     
        const app = express();
            app.use(bodyParser.urlencoded({extended: true}));
            debug('Receiving data to create bindings');
            app.post("/api/v1/bindings", function(req, res){
                switch(req.body.purpose){
                    case "showFigureCode":
                        bindings.showFigureCode(req.body);
                        res.send({callback:"ok"});
                        break;
                    default:
                        break;
                }
            });
    
        var bindingsListen = app.listen(conf.port, () => {
            resolve(bindingsListen);
        });
    });
};

bindings.readRmarkdown = function(compendium_id, mainfile){
    if (!compendium_id | !mainfile)
        throw new Error('File does not exist.');
    var paper = __dirname + "/" + compendium_id + "/" + mainfile;
    fs.exists(paper,function(ex){
        if (!ex)
            throw new Error('File does not exist.');
    });
    const readerStream = fs.createReadStream(paper);
    readerStream.setEncoding('utf8');
    var data = '';
    readerStream
        .on('data', function(chunk) {
           data += chunk;
        })
        .on('end', function(){
            bindings.saveRmarkdown(data);
            return data;
        })
        .on('error', function(err){
            debug(err);
        });    
};

bindings.saveRmarkdown = function(data){
    fs.writeFile(__dirname + '/testdata/paper_interactive.Rmd', data,'utf8', function(err){
        debug(err)
    });
}

module.exports = bindings;