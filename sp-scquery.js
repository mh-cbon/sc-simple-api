var split     = require('split')
var through2  = require('through2')

/*
Stream parser to parse output of sc query / sc queryEx
see fixtures/sc-query.txt
*/

var spScQuery = function () {

  var current;
  var found;
  var line = 0;
  var fnTransform = function (chunk, enc, cb) {

    chunk = chunk.toString()

    if (chunk.match(/^SERVICE_NAME:/)) {
      if (current) {
        found = current
        current = null;
      }

      current = {
        name:                chunk.match(/^SERVICE_NAME:\s(.+)/)[1].replace(/\s+$/, ''),
        display:             '',
        type:                '',
        typeText:            '',
        state:               '',
        stateText:           '',
        // see dwControlsAccepted at https://msdn.microsoft.com/en-us/library/windows/desktop/ms685996%28v=vs.85%29.aspx
        controls:            '',
        win32ExitCode:       '',
        win32ExitCodeHex:    '',
        serviceExitCode:     '',
        serviceExitCodeHex:  '',
        checkpoint:          '',
        waitHint:            '',
        pid:                 '',
        flags:               '',
      }

    } else if(current) {
      if (chunk.match(/^DISPLAY_NAME:/)) {
        current.display = chunk.match(/^DISPLAY_NAME:\s(.+)/)[1].replace(/\s+$/, '')

      } else if (chunk.match(/^\s+(TYPE|STATE|WIN32_EXIT_CODE|SERVICE_EXIT_CODE|CHECKPOINT|WAIT_HINT|PID|FLAGS)\s+:/)) {

        var prop = chunk.match(/^\s+(TYPE|STATE|WIN32_EXIT_CODE|SERVICE_EXIT_CODE|CHECKPOINT|WAIT_HINT|PID|FLAGS)\s+:/)[1]
        if (prop==="TYPE") {
          //         TYPE               : 20  WIN32_SHARE_PROCESS
          var k = chunk.match(/^\s+TYPE\s+:\s+([0-9]+)\s+([^\s]+)/)
          current.type = k && k[1]
          current.typeText = k && k[2]

        } else if (prop==="STATE") {
          //        STATE              : 4  RUNNING
          var k = chunk.match(/^\s+STATE\s+:\s+([0-9]+)\s+([^\s]+)/)
          current.state = k && k[1]
          current.stateText = k && k[2]

        } else if (prop==="WIN32_EXIT_CODE") {
          //         WIN32_EXIT_CODE    : 0  (0x0)
          var k = chunk.match(/^\s+WIN32_EXIT_CODE\s+:\s+([0-9]+)\s+\(([^)]+)\)/)
          current.win32ExitCode = k && k[1]
          current.win32ExitCodeHex = k && k[2]

        } else if (prop==="SERVICE_EXIT_CODE") {
          //        SERVICE_EXIT_CODE  : 0  (0x0)
          var k = chunk.match(/^\s+SERVICE_EXIT_CODE\s+:\s+([0-9]+)\s+\(([^)]+)\)/)
          current.serviceExitCode = k && k[1]
          current.serviceExitCodeHex = k && k[2]

        } else if (prop==="CHECKPOINT") {
          //         CHECKPOINT         : 0x0
          var k = chunk.match(/^\s+CHECKPOINT\s+:\s+(.+)/)
          current.checkpoint = k && k[1]

        } else if (prop==="WAIT_HINT") {
          //         WAIT_HINT          : 0x0
          var k = chunk.match(/^\s+WAIT_HINT\s+:\s+(.+)/)
          current.waitHint = k && k[1]

        } else if (prop==="PID") {
          //        PID                : 812
          var k = chunk.match(/^\s+PID\s+:\s+(.+)/)
          current.pid = k && k[1]

        } else if (prop==="FLAGS") {
          //         FLAGS          : ??
          var k = chunk.match(/^\s+FLAGS\s+:\s+(.+)/)
          current.flags = k && k[1]

        }

      } else if (chunk.match(/^\s+\([^)]+\)/)) {
        current.controls = chunk.match(/^\s+\(([^)]+)\)/)[1].split(/,/)

      } else if(chunk.length) {
        this.emit('error', 'Unhandled line at ' + line + '\n' + chunk)
      }
    } else if(chunk.length) {
      this.emit('error', 'Unhandled line at ' + line + '\n' + chunk)
    }

    line++;
    cb(null, found)
    found = null;
  }

  var fnFlush = function (cb) {
    if (current) this.push(current)
    cb()
  }
  return through2.obj(fnTransform, fnFlush)
}

module.exports = spScQuery
