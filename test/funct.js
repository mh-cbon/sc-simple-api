var should      = require('should');
var fs          = require('fs');
var SimpleScApi = require('../index.js');

describe('s-simple-api functional', function() {
  var ssa = new SimpleScApi()

  if ('elevate' in process.env) ssa.enableElevation(true)

  it('should not list the fake service', function(done) {
    ssa.list({}, function (err, list) {
      ('fake' in list).should.eql(false);
      done();
    })
  });

  it('should install a fake service', function(done) {
    ssa.nssmInstall('fake', 'C:\\nodejsx64\\node.exe', 'C:\\vagrant\\utils\\fake-service.js', function (err) {
      (err===null).should.eql(true);
      err && console.error(err);
      done();
    })
  });

  it.skip('should list the fake service', function(done) {
    ssa.list({}, function (err, list) {
      console.log(list['fake']);
      ('fake' in list).should.eql(true);
      done();
    })
  });

  it('should start the fake service', function(done) {
    ssa.start('fake', [], function (err) {
      setTimeout(function(){
        done(err);
      }, 500); // this is needed for the system to load and start the program.
    })
  });

  it('should list the fake service', function(done) {
    ssa.list({}, function (err, list) {
      ('fake' in list).should.eql(true);
      list['fake'].name.should.eql('fake');
      done();
    })
  });

  it('should be able to consume the service', function(done) {
    var net = require('net');
    var client = net.connect({port: 8080});
    var d;
    client.on('data', (data) => {
      d = data.toString()
    });
    client.on('end', () => {
      d.should.match(/goodbye/)
      done();
    });
    client.on('error', done);
  });

  it('should stop the fake service', function(done) {
    ssa.stop('fake', done)
  });

  it('should remove the fake service', function(done) {
    var service = {
      id: 'fake',
    }
    ssa.uninstall(service, done)
  });

  it('should not list the fake service', function(done) {
    ssa.list({}, function (err, list) {
      ('fake' in list).should.eql(false);
      done();
    })
  });
});
