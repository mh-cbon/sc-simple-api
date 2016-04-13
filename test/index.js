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
      (err===null).should.eql(true);
      ('WinRM' in items).should.eql(true);
      items['WinRM'].name.should.eql("WinRM")
      items['WinRM'].checkpoint.should.eql("0x0")
      items['WinRM'].display.should.eql('Windows Remote Management (WS-Management)')
      items['WinRM'].controls.should.eql([ 'STOPPABLE', ' NOT_PAUSABLE', ' ACCEPTS_SHUTDOWN' ])
      // Object.keys(items).length.should.eql(47); // notes: weird, sometimes it may change value... not reliable :(
      done();
    })
  });
  it('should properly fail to list services', function(done) {
    ssa.list({type: "NOT CORRECT"}, function (err, items) {
      (err===null).should.eql(false);
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
      description.checkpoint.should.eql("0x0")
      description.controls.should.eql([ 'STOPPABLE', ' NOT_PAUSABLE', ' ACCEPTS_SHUTDOWN' ])
      description.description.should.eql('Windows Remote Management (WinRM) service implements the '
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
      + 'IIS do not use the /wsman URL prefix.');
      description.display.should.eql("Windows Remote Management (WS-Management)")
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
      id: 'failure',
      type: 'share',
      displayname: 'My fake service',
      binpath: 'C:\\nodejsx64\\node.exe C:\\vagrant\\utils\\fake-service.js'
    }
    ssa.install(service, function (err) {
      (err===null).should.eql(true);
      err && console.error(err);
      done();
    })
  });
  it('should properly fail to install a service', function(done) {
    var service = {
      id: 'failure',
      displayname: 'My fake service',
      binpath: 'C:\\nodejsx64\\node.exe C:\\vagrant\\utils\\fake-service.js'
    }
    ssa.install(service, function (err) {
      (err===null).should.eql(false);
      err.should.match(/The specified service already exists/);
      done();
    })
  });

  it('should install a service with nssm', function(done) {
    ssa.nssmInstall('fake', 'C:\\nodejsx64\\node.exe', 'C:\\vagrant\\utils\\fake-service.js', function (err) {
      (err===null).should.eql(true);
      err && console.error(err);
      done();
    })
  });
  it('should properly fail to install a service with nssm', function(done) {
    ssa.nssmInstall('', '', '', function (err) {
      (err===null).should.eql(false);
      err && console.error(err);
      done();
    })
  });


  it('should start a service', function(done) {
    ssa.start('fake', [], function (err) {
      (err===null).should.eql(true);
      err && console.error(err);
      setTimeout(done, 1500)
    })
  });

  it('should properly fail to start a service', function(done) {
    ssa.start('failure', [], function (err) {
      (err===null).should.eql(false);
      err && console.error(err);
      done();
    })
  });


  it('should stop a service', function(done) {
    ssa.stop('fake', function (err) {
      (err===null).should.eql(true);
      err && console.error(err);
      done();
    })
  });

  it('should properly fail to stop a service', function(done) {
    ssa.stop('failure', function (err) {
      (err===null).should.eql(false);
      err && console.error(err);
      done();
    })
  });

  it('should remove a service', function(done) {
    var service = {
      id: 'failure',
    }
    ssa.uninstall(service, function (err) {
      (err===null).should.eql(true);
      err && console.error(err);
      done();
    })
  });
  it('should remove a service created with nssm', function(done) {
    var service = {
      id: 'fake',
    }
    ssa.uninstall(service, function (err) {
      (err===null).should.eql(true);
      err && console.error(err);
      done();
    })
  });
  it('should properly fail to remove a service', function(done) {
    var service = {
      id: 'wxcwxc',
    }
    ssa.uninstall(service, function (err) {
      (err===null).should.eql(false);
      err.should.match(/FAILED/);
      done();
    })
  });

});
