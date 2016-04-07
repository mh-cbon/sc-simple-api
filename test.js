var spawn = require('child_process').spawn;
var action = process.argv[2];
var serviceName = process.argv[3] || '';

console.log("serviceName %s", serviceName);

if (serviceName===''){
    console.log ("La variable serviceName est defini par la case process.argv[3] sinon celle-ci est vide, le pgroamme s'arrete.");
    process.exit(1);
}

// true et true = true
// true et false = false
// false et true = false
// false et false = false

if(action!='create' && action!='delete'){
    console.log (
        "Si ce message est affiché, alors le programme s'est arrete.)"
    );
    process.exit(1);
}

var    sc;

if (action=="create"){
    var binPath = process.argv[4] || '';
    var startMode = process.argv[5] || '';
    var displayName = process.argv[6] || '';

    if (binPath==''){
        console.log ("Le programme s'est arrete (binPath).");
        process.exit(1);
    }// fin de vérification que binPath n'est pas vide.

    // Vérification que binPath n'est pas vide, sinon fin de programme
    console.log("binPath %s", binPath);

    // Vérification des paramètres de startMode, sinon fin de programme
    console.log("startMode %s", startMode);

    var okStartMode = [/*'boot',*/'demand','auto','disabled'/*,'system'*/];
    if (okStartMode.indexOf(startMode) == -1){
        console.log ("Le programme s'est arrete (startMode).");
        process.exit(1);
    }

    // Vérification si displayName n'est pas vide, sinon fin de programme
    console.log("displayName %s", displayName);

    if (displayName==''){
        console.log ("Le programme s'est arrete (displayName).");
        process.exit(1);
    }// fin de vérification si displayName est vide.

    sc = spawn('sc', [
        action,
        serviceName,
        'start=', startMode,
        'binpath=', binPath,
        'displayname=', displayName,
    ]);

}else if(action=="delete"){
    sc = spawn('sc', [
        action,
        serviceName,
    ]);
}

sc.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});
sc.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});
sc.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});





/*
node marchearret.js create hello "C:\Users\PC Bureau Ghislain\Desktop\hello.bat" disabled HelloGhislain
node marchearret.js delete hello
*/
