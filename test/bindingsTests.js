'use strict';

const bindings = require('../controllers/bindings');
// const assert = require('assertthat');

 let req = {
    id: 'spacetime',
    mainfile: 'main.Rmd',
    codeLines: [{
        'start': 25,
        'end': 26
    },
    {
        'start': 
    }],
    variable: 'threshold <- 10',
    figure: 'Figure 4',
    widget: {
      type: 'slider',
      min: 0,
      max: 100,
      init: 50,
      step: 1,
      label: 'Change the threshold by using the slider.'
      }
};

test('test', () => {
    bindings.manipulateFigure(req);
});
