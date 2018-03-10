var tder = require('./index');
var fs = require('fs');


function format(certPath, outPath) {
    var ca = fs.readFileSync(certPath);
    var asn1 = tder.parsePem(ca);
    asn1 = tder.interpreter.certInterpreter(asn1);
    fs.writeFileSync(outPath, JSON.stringify(asn1, undefined, '  '))
}

var fieldNames = JSON.parse(fs.readFileSync('./fieldNames.json') + '')
format('./certs/github.cer', 'github.json');
format('./certs/ca.org1.example.com-cert.pem', 'ca.org1.example.com-cert.json');
// format('./certs/org1AdminPrivateKey.pem', 'org1AdminPrivateKey.json');