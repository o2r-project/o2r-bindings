'use strict';

const bindings = require('../controllers/bindings');
// const assert = require('assertthat');

let req = {
    id: 'testdata',
    mainfile: 'testfile.Rmd',
    task: 'inspect',
    purpose: 'showFigureCode',
    result: '3.14',
    lineOfResult: 24,
    codeLines: ['17', '25']
};

test('test', () => {
    let content = bindings.showCode(req);
});
