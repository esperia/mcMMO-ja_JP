const FetchWiki = require('./fetch-wiki');
const PropertiesParser = require('./parser-properties');
var debug = require('./debug')('commands');
var path = require('path');

const rootDir = path.resolve(__dirname, '..');
var targets = [{
  url: 'http://mcwiki.8x9.jp/index.php?title=McMMO(%E7%BF%BB%E8%A8%B3)&action=edit',
  files: [{
    name: 'locale_ja_JP_full.properties',
    id: 'locale_ja_JP_full_properties',
    to: 'src'
  }],
}];


// exec
// ----------------
//console.log(process.argv);

var commands = [{
  name: 'fetch',
  exec: function() {
    var fetchWiki = new FetchWiki(targets, rootDir);
    fetchWiki.fetchAll()
    .then(() => {
      debug('All done!');
    })
    .catch(e => {
      debug(e);
    });
  },
}, {
  name: 'build',
  exec: function() {
    var pParser = new PropertiesParser(`${rootDir}/src/locale_ja_JP_full.properties`);
    pParser.parse()
    .then(count => {
      return pParser.writeJa(`${rootDir}/src/locale_ja_JP.properties`);
    })
    .then(() => {
      var writeTo = `${rootDir}/mcMMO/src/main/resources/locale/locale_ja_JP.properties`;
      debug(`Write to: ${writeTo}`);
      return pParser.convertProperties(writeTo);
    })
    .then(count => {
      debug('Succeeded!');
    })
    .catch(errors => {
      debug('errors=', errors);
    });
  },
}, {
  name: 'match-keys',
  exec: function() {
    var parsers = [
      new PropertiesParser(`${rootDir}/mcMMO/src/main/resources/locale/locale_en_US.properties`), // base
      new PropertiesParser(`${rootDir}/src/locale_ja_JP_full.properties`),
    ];
    Promise.all(parsers.map(_ => _.parse()))
    .then(() => {
      return new Promise((resolve, reject) => {
        var errors = [];
        var base = parsers.shift();
        base.keys.forEach(key => {
          parsers.forEach(parser => {
            // Skip if key is empty.
            if (!key) {
              return;
            }
            //debug('key1');
            var found = parser.keys.find(_ => _ === key);
            if (!found) {
              // empty value
              errors.push({
                key,
                filepath: parser.filepath,
              });
            }
          });
        });

        if (errors.length) {
          var err = new Error(`Found not contain keys: count=${errors.length}`);
          err.errors = errors;
          reject(err);
        } else {
          resolve();
        }
      });
    })
    .then(count => {
      debug('Succeeded!');
    })
    .catch(errors => {
      debug('errors=', errors);
    });
  },
}];

var executed = commands.filter(command => {
  if (process.argv[2] === command.name) {
    command.exec();
    return true;
  }
});

if (executed.length === 0) {
  var commandNames = commands.map(command => command.name).join(', ');
  console.log(`Available commands: [${commandNames}]`);
}

