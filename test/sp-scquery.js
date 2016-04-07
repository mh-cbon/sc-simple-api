var should    = require('should');
var fs        = require('fs');
var split     = require('split');
var through2  = require('through2');
var path      = require('path');
var spScQuery = require('../sp-scquery.js');

describe('stream parser sc query', function() {
  it('should parse all entries', function(done) {
    var services = []
    fs.createReadStream(path.join(__dirname, '..', 'fixtures/sc-query.txt'))
    .pipe(split())
    .pipe(spScQuery())
    .pipe(through2.obj(function (chunk, enc, cb) {
      services.push(chunk);
      cb(null, chunk)
    }, function (cb) {
      services[0].should.eql({
        checkpoint: '0x0',
        controls: [ 'STOPPABLE', ' NOT_PAUSABLE', ' IGNORES_SHUTDOWN' ],
        display: 'Base Filtering Engine',
        flags: null,
        name: 'BFE',
        pid: '384',
        serviceExitCode: '0',
        serviceExitCodeHex: '0x0',
        state: '4',
        stateText: 'RUNNING',
        type: '20',
        typeText: 'WIN32_SHARE_PROCESS',
        waitHint: '0x0',
        win32ExitCode: '0',
        win32ExitCodeHex: '0x0'

      })
      services[services.length-1].should.eql({
        checkpoint: '0x0',
        controls: [ 'STOPPABLE', ' NOT_PAUSABLE', ' ACCEPTS_PRESHUTDOWN' ],
        display: 'Windows Update',
        flags: null,
        name: 'wuauserv',
        pid: '812',
        serviceExitCode: '0',
        serviceExitCodeHex: '0x0',
        state: '4',
        stateText: 'RUNNING',
        type: '20',
        typeText: 'WIN32_SHARE_PROCESS',
        waitHint: '0x0',
        win32ExitCode: '0',
        win32ExitCodeHex: '0x0'
      })
      services.length.should.eql(50)
      cb()
      done();
    }).resume())
  });

});
