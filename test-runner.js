/**
 * Module dependencies.
 */

var stylus = require('stylus');
var fs = require('fs');
var csso = require('csso');
var autoprefixer = require('autoprefixer');
var glob = require('glob');
var Comb = require('csscomb');
var whatToTest = process.env.npm_package_config_whatToTest || '**';
var comb = new Comb();
comb.configure(require('./.csscomb.json'));

// test cases

glob.sync("./lib/**/" + whatToTest + "/tests/*.styl").forEach(function(test){
  var name = test.replace(/\.?[\/]/g, ' ').replace(' tests',':').replace('.styl','');
  if(name.indexOf(' old_') != -1) {
    return;
  }

  it(name, function(){
    var css = fs.readFileSync(test.replace('.styl', '.css'), 'utf8').replace(/\r/g, '').trim();
    var style = stylus('@import "lib/standalone.styl"; @import "' + test + '"');

    style.render(function(err, actual){
      if (err) throw err;
      actual = autoprefixer("last 2 versions", "> 2%").process(actual).css;
      actual = csso.justDoIt(actual);
      actual = comb.processString(actual);

      // Remove those hardfixes when there would be a way to do this in csscomb
      actual = actual.replace(/([^\+>])([\+>])\./g,'$1 $2 .');
      actual = actual.replace(/\)(,?)([^:\)\s,;])/g,')$1 $2');
      actual = actual.replace(/, ?(\.|label|input|x\:)/g,',\n$1');
      actual = actual.replace(/([^ ])\}/g,'$1}\n');
      actual = actual.replace(/,(\S)/g,', $1');
      actual = actual.replace(/base64, /g,'base64,');
      actual = actual.replace(/background: 0 0/g,'background: transparent');
      actual = actual.replace(/font-weight: 700/g,'font-weight: bold');
      actual = actual.replace(/([^ ])!important/g,'$1 !important');
      actual = actual.replace(/inset,([^ ])/g,'inset, $1');
      actual = actual.replace(/\)rgba/g,') rgba');

      // CSSO strips ie9 hack, should replace with smth else
      actual = actual.replace(/color: #000 \\0\/;/g,'color: transparent;\n  color: #000 \\0/;');

      actual.trim().should.equal(css);
    });
  })
});

