//
// wiki向け
//

var debug = require('./debug')('parser');

/**
 * @param {Array} files
 * @return {undefined} filesに格納する
 */
exports.parse = function(window, $body, files) {
  var $ = window.$;
  var document = window.document;

  var $box = $('#wpTextbox1');
  //debug($box);
  var html = $box[0].innerHTML;
  var target = null;
  var targetLines = [];
  html.split('\n').forEach(line => {
    if (!target) {
      var matches = line.match(/id="([^\"]+)"/);
      if (matches) {
        debug('matches.length:', matches.length);
        files.forEach(file => {
          if (matches[1] === file.id) {
            debug('Start reading... file:', file.name);
            target = file;
          }
        });
      }
    } else {
      if (line.indexOf('/syntaxhighlight') >= 0) {
        targetLines.push('');

        target.src = targetLines.join('\n');
        targetLines = [];

        debug('finished!: ', target.name);
        target = null;
      } else {
        line = line.replace(/&lt;/g, '<');
        line = line.replace(/&gt;/g, '>');
        line = line.replace(/&amp;/g, '&');
        targetLines.push(line);
      }
    }
  });
};

