var versionArr = ["v0.10.", "v0.12.","v4.","v5."];
var passVer = false;
for (var i=0; i<versionArr.length; i++) {
  if (process.version.indexOf(versionArr[i]) === 0) {
    passVer = true;
    break;
  }
}
if (!passVer) throw new Error("nodejs now version " + process.version + " must be " + versionArr.join("x ") + "x");
var verArr = process.version.split(".");
if(verArr[0] === "v4") verArr[1] = "0";
if(verArr[0] === "v5") verArr[1] = "0";
require.extensions['.node_' + verArr[0] + verArr[1] + "_" + process.platform + "_" + process.arch] = function(module, filename) {
  return require.extensions['.node'](module, filename);
};
var EventEmitter = require('events').EventEmitter;
var util = require('util');
// Only support nodejs v0.6 and on so no need to look for older module location
var expat = require('./node_expat');
var Stream = require('stream').Stream;

var Parser = function(encoding) {
  this.parser = new expat.Parser(encoding);
  this.parser.emit = this.emit.bind(this);

  //stream API
  this.writable = true;
  this.readable = true;
};
util.inherits(Parser, Stream);

Parser.prototype.parse = function(buf, isFinal) {
  return this.parser.parse(buf, isFinal);
};

Parser.prototype.setEncoding = function(encoding) {
  return this.parser.setEncoding(encoding);
};

Parser.prototype.getError = function() {
  return this.parser.getError();
};
Parser.prototype.stop = function() {
  return this.parser.stop();
};
Parser.prototype.pause = function() {
  return this.stop();
};
Parser.prototype.resume = function() {
  return this.parser.resume();
};

Parser.prototype.destroy = function() {
  this.parser.stop();
  this.end();
};

Parser.prototype.destroySoon = function() {
  this.destroy();
};

Parser.prototype.write = function(data) {
    var error, result;
    try {
	result = this.parse(data);
	if (!result)
	    error = this.getError();
    } catch (e) {
	error = e;
    }
    if (error) {
	this.emit('error', error);
	this.emit('close');
    }
    return result;
};

Parser.prototype.end = function(data) {
    var error, result;
    try {
	result = this.parse(data || "", true);
	if (!result)
	    error = this.getError();
    } catch (e) {
	error = e;
    }

    if (!error)
	this.emit('end');
    else
	this.emit('error', error);
    this.emit('close');
};

Parser.prototype.reset = function() {
    return this.parser.reset();
};
Parser.prototype.getCurrentLineNumber = function() {
    return this.parser.getCurrentLineNumber();
};
Parser.prototype.getCurrentColumnNumber = function() {
    return this.parser.getCurrentColumnNumber();
};
Parser.prototype.getCurrentByteIndex = function() {
    return this.parser.getCurrentByteIndex();
};

//Exports

exports.Parser = Parser;

exports.createParser = function(cb) {
  var parser = new Parser();
  if(cb)  { parser.on('startElement', cb); }
  return parser;
};
