var spawn     = require('child_process').spawn;
var path      = require('path')
var split     = require('split')
var through2  = require('through2')
var spScQuery = require('./sp-scquery.js');
var nssm      = require("@mh-cbon/nssm-prebuilt")

function SimpleScApi (version) {

  var scPath = 'sc'
  this.setScPath = function (k) {
    scPath = k;
  }

  this.list = function (opts, then) {
    var services = {};
    var args = ['queryEx']
    if (opts.type) {
      if (typeof(opts.type) === "string") args = args.concat(["type=", opts.type])
      else args = args.concat(["type=", opts.type[0], "type=", opts.type[1]])
    }
    if (opts.state) args = args.concat(["state=", opts.state])
    if (opts.group) args = args.concat(["group=", opts.group])
    // ri and bufSize are ignored.

    var c = spawn(scPath, args, {stdio: 'pipe'})

    var s = spScQuery();
    s.on('error', function (err){
      then(err);
      then = null;
    });

    c.stdout
    .pipe(split())
    .pipe(s)
    .pipe(through2.obj(function (chunk, enc, cb) {
      services[chunk.name] = chunk;
      cb(null, chunk)
    }, function (cb) {
      cb()
      then && then(null, services)
    }).resume())

    c.on('error', then);

    return c;
  }

  this.qdescribe = function (serviceId, then) {
    var description = "";
    var args = ['qdescription', serviceId]

    var c = spawn(scPath, args, {stdio: 'pipe'})

    var hasFailed = false
    var failure = ""
    var started = false
    c.stdout
    .pipe(split())
    .pipe(through2(function (chunk, enc, cb) {
      chunk = chunk.toString()
      if (chunk.match(/^DESCRIPTION:/)) {
        started = true
        chunk = chunk.replace(/^DESCRIPTION:/, '')
      } else if(!hasFailed && !started && chunk.match(/FAILED\s+[0-9]+/)) {
        // [SC] OpenService FAILED 1060:
        hasFailed = true;
      } else if(hasFailed) {
        failure += chunk + ' ';
      }
      if (started) description += chunk + ' ';
      cb(null)
    }, function (cb) {
      cb()
      description = description.replace(/^\s+/, '').replace(/\s+$/, '');
      failure = failure.replace(/^\s+/, '').replace(/\s+$/, '');
      if (hasFailed) return then(failure)
      then(null, description)
    }).resume())

    c.on('error', then);

    return c;
  }

  this.describe = function (serviceId, then) {
    var info = {}
    var that = this;
    return that.list({}, function (err, items) {
      if (err) return then(err);
      if (!items[serviceId]) return then('not found');
      info = items[serviceId];
      that.qdescribe(serviceId, function (err2, description) {
        if (err2) return then(err2)
        info.description = description;
        then(null, info);
      })
    })
  }

  this.config = function (opts, then) {
    var args = ['config', opts.id]
    if (opts.type) {
      if (typeof(opts.type) === "string") args = args.concat(["type=", opts.type])
      else args = args.concat(["type=", opts.type[0], "type=", opts.type[1]])
    }
    if (opts.start) args = args.concat(["start=", opts.start])
    if (opts.error) args = args.concat(["error=", opts.error])
    if (opts.binpath) args = args.concat(["binpath=", opts.binpath])
    if (opts.group) args = args.concat(["group=", opts.group])
    if (opts.tag) args = args.concat(["tag=", opts.tag])
    if (opts.depend) args = args.concat(["depend=", opts.depend])
    if (opts.obj) args = args.concat(["obj=", opts.obj])
    if (opts.displayname) args = args.concat(["displayname=", opts.displayname])
    if (opts.password) args = args.concat(["password=", opts.password])

    var c = spawn(scPath, args, {stdio: 'pipe'})

    var data = '';
    var hasFailed = false;
    c.stdout.on('data', function (d) {
      d = d.toString();
      if (!hasFailed && d.match(/ChangeServiceConfig SUCCESS/)) {
        hasFailed = false
      } else if (!hasFailed && d.match(/ERROR:/)) {
        hasFailed = true
      }
      data += d
    });

    c.on('close', function (code) {
      then(hasFailed ? data : null)
    });

    c.on('error', then);

    return c;
  }

  this.start = function (serviceId, args, then) {
    var args = ['start', serviceId].concat(args)

    var c = spawn(scPath, args, {stdio: 'pipe'})

    c.on('close', function (code) {
      then(code>0 ? 'got error' : null)
    });

    c.on('error', then);

    return c;
  }
  this.stop = function (serviceId, then) {
    var args = ['stop', serviceId]

    var c = spawn(scPath, args, {stdio: 'pipe'})

    c.stdout.pipe(process.stdout);
    c.stderr.pipe(process.stderr);

    c.on('close', function (code) {
      then(code>0 ? 'got error' : null)
    });

    c.on('error', then);

    return c;
  }
  this.restart = function (serviceId, args, then) {
    var that = this;
    return that.stop(serviceId, function (err) {
      if (err) return then(err);
      that.start(serviceId, args, then)
    })
  }

  this.nssmInstall = function (serviceId, binPath, strArgs, then) {

    var args = ['install', serviceId, binPath, strArgs]

    var c = spawn(nssm.path, args, {stdio: 'pipe'})

    var hasFailed = false;

    var stdout = '';
    c.stdout.on('data', function (d) {
      stdout += d.toString() + ' ';
    })
    var stderr = '';
    c.stderr.on('data', function (d) {
      stderr += d.toString() + ' ';
    })

    c.on('close', function (code) {
      if (stdout.match(/installed success/)) {
        hasFailed = false;
      }
      // small subtility, stderr will print like this
      // E\u0000r\u0000r\u0000o\u0000r\u0000 \u0000c\u0000r\u0000e\u0000
      // so lets get ride of those NUL values
      stderr = stderr.replace(/\u0000/g, '')
      if (stderr.match(/Error\s+creating/i)) {
        hasFailed = true
      }
      then(hasFailed ? stderr : null)
    });

    c.on('error', then);

    return c;
  }

  this.install = function (opts, then) {
    var args = ['create', opts.id]
    if (opts.type) {
      if (typeof(opts.type) === "string") args = args.concat(["type=", opts.type])
      else args = args.concat(["type=", opts.type[0], "type=", opts.type[1]])
    }
    if (opts.start) args = args.concat(["start=", opts.start])
    if (opts.error) args = args.concat(["error=", opts.error])
    if (opts.binpath) args = args.concat(["binpath=", opts.binpath])
    if (opts.group) args = args.concat(["group=", opts.group])
    if (opts.tag) args = args.concat(["tag=", opts.tag])
    if (opts.depend) args = args.concat(["depend=", opts.depend])
    if (opts.obj) args = args.concat(["obj=", opts.obj])
    if (opts.displayname) args = args.concat(["displayname=", opts.displayname])
    if (opts.password) args = args.concat(["password=", opts.password])

    var c = spawn(scPath, args, {stdio: 'pipe'})

    var data = '';
    var hasFailed = false;
    c.stdout.on('data', function (d) {
      d = d.toString();
      if (!hasFailed && d.match(/CreateService SUCCESS/)) {
        hasFailed = false
      } else if (!hasFailed && d.match(/FAILED\s+[0-9]+/)) {
        hasFailed = true
      }
      data += d
    });

    c.on('close', function (code) {
      then(hasFailed ? data : null)
    });

    c.on('error', then);

    return c;
  }

  this.uninstall = function (opts, then) {
    var args = ['delete', opts.id]

    var c = spawn(scPath, args, {stdio: 'pipe'})

    var data = '';
    var hasFailed = false;
    c.stdout.on('data', function (d) {
      d = d.toString();
      if (!hasFailed && d.match(/DeleteService SUCCESS/)) {
        hasFailed = false
      } else if (!hasFailed && d.match(/FAILED\s+[0-9]+/)) {
        hasFailed = true
      }
      data += d
    })

    c.on('close', function (code) {
      then(hasFailed ? data : null)
    });

    c.on('error', then);

    c.stdout.pipe(process.stdout);
    c.stderr.pipe(process.stderr);

    return c;
  }

}

module.exports = SimpleScApi;
