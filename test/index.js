var should      = require('should');
var fs          = require('fs');
var split       = require('split');
var through2    = require('through2');
var path        = require('path');
var SimpleScApi = require('../index.js');

describe('simple sc api', function() {
  var ssa = new SimpleScApi()
  it('should list services', function(done) {
    ssa.list({}, function (err, items) {
      (err===null).should.be.true;
      ('WinRM' in items).should.be.true;
      items['WinRM'].should.eql({
        name: 'WinRM',
       display: 'Windows Remote Management (WS-Management)',
       type: '20',
       typeText: 'WIN32_SHARE_PROCESS',
       state: '4',
       stateText: 'RUNNING',
       controls: [ 'STOPPABLE', ' NOT_PAUSABLE', ' ACCEPTS_SHUTDOWN' ],
       win32ExitCode: '0',
       win32ExitCodeHex: '0x0',
       serviceExitCode: '0',
       serviceExitCodeHex: '0x0',
       checkpoint: '0x0',
       waitHint: '0x0',
       pid: '924',
       flags: null
      })
      Object.keys(items).length.should.eql(47); // notes: weird, sometimes it may change value... not reliable :(
      done();
    })
  });
  it('should properly fail to list services', function(done) {
    ssa.list({type: "NOT CORRECT"}, function (err, items) {
      (err===null).should.be.false;
      err.should.match(/ERROR:/)
      done();
    })
  });
  it('should qdescribe a service', function(done) {
    ssa.qdescribe('WinRM', function (err, description) {
      (err===null).should.eql(true);
      description.should.match(/Windows Remote Management/)
      done();
    })
  });
  it('should properly fail to qdescribe a service', function(done) {
    ssa.qdescribe('wxcxwcxwc', function (err, description) {
      (err===null).should.eql(false);
      err.should.match(/does not exist/)
      done();
    })
  });
  it('should describe a service', function(done) {
    ssa.describe('WinRM', function (err, description) {
      (err===null).should.eql(true);
      description.should.eql({
        checkpoint: '0x0',
        controls: [ 'STOPPABLE', ' NOT_PAUSABLE', ' ACCEPTS_SHUTDOWN' ],
        description: 'Windows Remote Management (WinRM) service implements the '
        + 'WS-Management protocol for remote management. WS-Management is a '
        + 'standard web services protocol used for remote software and '
        + 'hardware management. The WinRM service listens on the network for '
        + 'WS-Management requests and processes them. The WinRM Service needs '
        + 'to be configured with a listener using winrm.cmd command line tool '
        + 'or through Group Policy in order for it to listen over the network. '
        + 'The WinRM service provides access to WMI data and enables event '
        + 'collection. Event collection and subscription to events require '
        + 'that the service is running. WinRM messages use HTTP and HTTPS '
        + 'as transports. The WinRM service does not depend on IIS but is '
        + 'preconfigured to share a port with IIS on the same machine.  The '
        + 'WinRM service reserves the /wsman URL prefix. To prevent conflicts '
        + 'with IIS, administrators should ensure that any websites hosted on '
        + 'IIS do not use the /wsman URL prefix.',
        display: 'Windows Remote Management (WS-Management)',
        flags: null,
        name: 'WinRM',
        pid: '924',
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
      done();
    })
  });
  it('should properly fail to describe a service', function(done) {
    ssa.describe('wxcxwcxwc', function (err, description) {
      (err===null).should.eql(false);
      err.should.match(/not found/)
      done();
    })
  });

  it('should install a service', function(done) {
    var service = {
      id: 'fake',
      type: 'share',
      displayname: 'My fake service',
      binpath: 'C:\\nodejsx64\\node.exe C:\\vagrant\\utils\\fake-service.js'
    }
    ssa.install(service, function (err) {
      (err===null).should.eql(true);
      done();
    })
  });
  it('should properly fail to install a service', function(done) {
    var service = {
      id: 'fake',
      displayname: 'My fake service',
      binpath: 'C:\\nodejsx64\\node.exe C:\\vagrant\\utils\\fake-service.js'
    }
    ssa.install(service, function (err) {
      (err===null).should.eql(false);
      err.should.match(/The specified service already exists/);
      done();
    })
  });

  it('should start a service', function(done) {
    ssa.start('fake', [], function (err) {
      (err===null).should.eql(true);
      done();
    })
  });
  it('should properly fail to start a service', function(done) {
    ssa.start('xcvcxvcxvcxv', [], function (err) {
      (err===null).should.eql(false);
      done();
    })
  });

  // it('should remove a service', function(done) {
  //   var service = {
  //     id: 'fake',
  //   }
  //   ssa.uninstall(service, function (err) {
  //     (err===null).should.eql(true);
  //     done();
  //   })
  // });
  // it('should properly fail to remove a service', function(done) {
  //   var service = {
  //     id: 'fake',
  //   }
  //   ssa.uninstall(service, function (err) {
  //     (err===null).should.eql(false);
  //     err.should.match(/FAILED/);
  //     done();
  //   })
  // });

});
