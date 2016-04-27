# sc-simple-api

A simple API to manage windows services via SC / NSSM.

# Install

```sh
npm i @mh-cbon/sc-simple-api --save
```

# Usage

```js
var SimpleScApi = require('@mh-cbon/simple-sc-api')

var ssa = new SimpleScApi()

// sc queryEx type= service
ssa.list({type: "service"}, function (err, items) {
  console.log(items)
})

// sc qdescribe serviceId
ssa.qdescribe("serviceId", function (err, info) {
  console.log(info)
})

// sc qdescribe serviceId + sc queryEx
ssa.describe("serviceId", function (err, info) {
  console.log(info)
})

// sc config fake type= service
ssa.config('fake', {type: "service"}, function (err) {
  err && console.error(err);
})

// sc create failure type= share displayname= "My fake service" \
// binpath= "C:\\nodejsx64\\node.exe C:\\vagrant\\utils\\fake-service.js"
var service = {
  id: 'failure',
  type: 'share',
  displayname: 'My fake service',
  binpath: 'C:\\nodejsx64\\node.exe C:\\vagrant\\utils\\fake-service.js'
}
ssa.install(service, function (err) {
  err && console.error(err);
})

// nssm.exe serviceId C:\\nodejsx64\\node.exe C:\\vagrant\\utils\\fake-service.js
ssa.nssmInstall('serviceId', 'C:\\nodejsx64\\node.exe', 'C:\\vagrant\\utils\\fake-service.js', function (err) {
  err && console.error(err);
})

// sc start fake some= args
ssa.start('fake', ["some=", "args"], function (err) {
  err && console.error(err);
})

// sc stop fake + sc start fake some= args
ssa.restart('fake', ["some=", "args"], function (err) {
  err && console.error(err);
})

// sc stop fake
ssa.stop('fake', function (err) {
  err && console.error(err);
})

// sc delete fake
ssa.uninstall('fake', function (err) {
  err && console.error(err);
})
```

# Testing

To run the __windows__ tests on a fedora-like box,

- download and install [vagrant from their website](https://www.vagrantup.com/downloads.html), do not use distrib package. WinRM is somehow broken at that day.
- install [winrm plugin](https://github.com/criteo/vagrant-winrm): `vagrant plugin install vagrant-winrm`
- execute `npm run test-windows`
- wait, a looooooonnnnggggg time. Windows images are very big....

# Read more
- https://msdn.microsoft.com/en-us/library/windows/desktop/ms685996%28v=vs.85%29.aspx
- https://msdn.microsoft.com/fr-fr/library/windows/desktop/ee126211%28v=vs.85%29.aspx
- https://msdn.microsoft.com/en-us/library/windows/desktop/ms685138%28v=vs.85%29.aspx
- http://nssm.cc/commands
- https://technet.microsoft.com/en-us/library/cc742126.aspx

# notes

If you start to experience weirds behaviors, reboot your windows. As an example, see [this](http://stackoverflow.com/questions/20561990/how-to-solve-the-specified-service-has-been-marked-for-deletion-error)
