var debug = require('./debug')('fetch-wiki');
var request = require('request')
var jsdom = require('jsdom');
var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var mkdirp = require('mkdirp');
var parserWiki = require('./parser-wiki');

class FetchWiki {

  constructor(targets, rootDir) {
    this.targets = targets;
    this.rootDir = rootDir;
  }

  fetchAll() {
    return Promise.all(this.targets.map(target => {
      return this.fetch(target);
    }));
  }

  parseAll() {
    return Promise.all(this.targets.map(target => {
      return new Promise((resolve, reject) => {
        Promise.all(target.files.map(file => this.parseCheck(file)))
        .then(result => {
          debug('All yaml check done!');
          //target.yamlCheckResult = result;
          resolve(target);
        })
        .catch(e => reject(e));
      });
    }));
  }

  fetch(target) {
    var self = this;
    return new Promise((resolve, reject) => {
      debug(`start request to ${target.url}...`);
      var options = {
      };
      options.uri = target.url;
      request.get(options, function(err, response, body) {
        if (err) reject(err);
        if (!(200 <= response.statusCode && response.statusCode < 300)) {
          return reject(new Error('Illegal statusCode: ' + response.statusCode));
        }
        debug(`fetched. parse by jsdom`);

        jsdom.env({
          html: body,
          scripts: ["http://code.jquery.com/jquery-1.12.2.min.js"],
          //scripts: ["http://code.jquery.com/jquery.js"],
          done: function (err, window) {
            if (err) return reject(err);

            var $ = window.$;

            // Parse
            var $bodyContent = $('#bodyContent');
            debug(`parse...`);
            parserWiki.parse(window, $bodyContent, target.files);

            // Save
            Promise.all(target.files.map(file => self.saveFile(file)))
            .then(files => {
              debug(`Saved files: length=${files.length}`);
              return resolve(files)
            })
            .catch(e => reject(e));
          }
        });
      });
    });
  }

  saveFile(file) {
    return new Promise((resolve, reject) => {
      var fileDirPath = this.rootDir + '/' + file.to;
      var filepath = fileDirPath + '/' + file.name;

      mkdirp(fileDirPath, function (err) {
        if (err) return reject(err);

        fs.writeFile(filepath, file.src, function (err) {
          if (err) return reject(err);
          debug(`saveFile: filepath=${filepath}`);

          resolve(file);
        });
      });
    });
  }

  parseCheck(file) {
    return new Promise((resolve, reject) => {
      var fileDirPath = this.rootDir + '/' + file.to;
      var filepath = fileDirPath + '/' + file.name;
      if (path.parse(filepath).ext !== '.yml') {
        // yamlではないのでパース対象から外す
        return resolve();
      }
      fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) return reject(err);

        try {
          debug(`Parse start... name: ${file.name}`);
          var doc = yaml.safeLoad(data);
          debug(`Parse finished.`);
          resolve(doc);
        } catch (err) {
          err.filepath = filepath;
          reject(err);
        }
      });
    });
  }
}

module.exports = FetchWiki;
