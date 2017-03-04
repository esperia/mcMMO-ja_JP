var readline = require('readline');
var fs = require('fs');
const exec = require('child_process').exec;

var debug = require('./debug')('parser');

class PropertiesParser {
  constructor(filepath) {
    this.filepath = filepath;

    this.errors = [];
    this.keys = [];
    this.jaLines = [];
  }

  parse() {
    return new Promise((resolve, reject) => {
      var lineReader = readline.createInterface({
        input: fs.createReadStream(this.filepath)
      });

      var lineCount = 0;
      lineReader.on('line', line => {
        //console.log('Line from file:', line);
        lineCount++;
        try {
          if (line === '') {
            this.jaLines.push(line);
            return;
          }
          const noPos = line.indexOf('#');
          if (noPos === 0) {
            // comments
            this.jaLines.push(line);
            return;
          }
          const eqPos = line.indexOf('=');
          if (eqPos === -1) throw new Error(`Illegal line: line=${line}, count=${lineCount}`);

          var key = line.substring(0, eqPos);
          var value = line.substring(eqPos+1, line.length);
          //console.log(`key=${key}, value=${value}`);

          if (this.keys.filter(_ => _ === key).length > 0) {
            throw new Error(`Duplicate line: line=${line}, count=${lineCount}`);
          }
          this.keys.push(key);

          // multibytes
          if (line.length !== Buffer.byteLength(line, 'utf8')) {
            //debug(`include multibyte-string: line=${line}`);
            this.jaLines.push(line);
          }
        } catch(e) {
          debug(e.toString());
          this.errors.push(e);
        }
      });
      lineReader.on('close', line => {
        if (this.errors.length === 0) {
          resolve();
        } else {
          reject(this.errors);
        }
      });
    });
  }

  writeJa(to) {
    return new Promise((resolve, reject) => {
      fs.writeFile(to, this.jaLines.join('\n'), err => {
        if (err) return reject(err);
        //console.log(err);
        resolve();
      });
    });
  }

  convertProperties(outfilepath) {
    return new Promise((resolve, reject) => {
      exec(`native2ascii ${this.filepath} ${outfilepath}`, (err, stdout, stderr) => {
        if (err) return reject(err);

        resolve(stdout);
      });
    });
  }
}

module.exports = PropertiesParser;
