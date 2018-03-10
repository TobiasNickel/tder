var fieldNames = require('./fieldNames');

module.exports.parse = parse;
module.exports.parsePem = buffer => {
    var buffer = Buffer.from(
        (buffer + '').split('\r').join('')
        .split('\n')
        .filter(line => line.indexOf('-----'))
        .join(''), 'base64')
    console.log(buffer.toString('hex'))
    return parse(buffer);
};

const tagClasses = {
    '0': 'Universal',
    '1': 'Application',
    '2': 'Context-specific',
    '3': 'Private',
}
var counter = 0;
/**
 * 
 * @param {Buffer} buffer 
 */
function parse(buffer) {
    //console.log(buffer.toString('hex'))
    var octet1 = buffer.readUInt8(0);
    var octet2 = buffer.readUInt8(1);
    //console.log(octet1, printByte(octet1));
    var tagClass = tagClasses[(octet1 & 0b11000000) >> 6];
    var type = octet1 & 0x00011111;
    var isConstructed = !!(octet1 & 0b00100000)
    var dataLength; // = buffer.readUInt16BE(2);
    var isShort = !(octet2 & 0b10000000);
    //console.log(tagClass, isConstructed)

    // //console.log('isshort', isShort)
    // console.log();
    // console.log();
    // console.log();
    // console.log();
    // console.log(printByte(octet1), printByte(octet2), buffer.length.toString(16), buffer.toString())
    var headerLength;
    var data;
    if (isShort) {
        headerLength = 2;
        dataLength = octet2;
        data = buffer.slice(2, dataLength + 2)
    } else if (octet2 == 0b10000001) {
        headerLength = 3;
        //console.log('uint8')
        dataLength = buffer.readUInt8(2);
        data = buffer.slice(3, dataLength + 3)
    } else if (octet2 == 0b10000010) {
        headerLength = 4;
        dataLength = buffer.readUInt16BE(2);
        //console.log('uint16', dataLength, printByte(octet1), printByte(octet2))
        data = buffer.slice(4, dataLength + 4)
    } else if (octet2 == 0b10000100) {
        headerLength = 6;
        //console.log('uint32')
        dataLength = buffer.readUInt32BE(2);
        data = buffer.slice(6, dataLength + 6)
    } else {
        headerLength: 0
            //console.log(printByte(octet1), printByte(octet2), buffer.length.toString(16), buffer.toString('hex'))
        return {
            headerLength,
            dl: buffer.length,
            dataLength: buffer.length,
            dataString: buffer + '',
            data: buffer.toString('hex')
        };
        throw new Error('longer not jet implemented, just do it')
    }
    var child;
    if (isConstructed) { //|| type == 0x10
        child = parseContruct(data)
    } else {}

    return {
        headerLength,
        tagClass,
        isConstructed,
        isShort,
        type: typeByCode[type],
        dataLength,
        dl: data.length,
        data: data.toString('hex'),
        dataString: data.toString(),
        child,
    };
}
/**
 * 
 * @param {Buffer} buffer 
 */
function parseContruct(buffer) {
    //console.log('parseCOnstruct', counter++, buffer.toString());
    var pos = 0;
    var parts = []
    do {
        var lastPos = pos;
        var info = parse(buffer.slice(pos));
        pos += info.dl + info.headerLength;
        parts.push(info);
    } while (pos < buffer.length && pos > lastPos)
    //console.log(pos, buffer.length, parts.length)
    return parts;
}

function printByte(int) {
    var s = int.toString(2);
    while (s.length % 8) {
        s = '0' + s;
    }
    return s;
}
module.exports.interpreter = {
    reduce,
    interpretDerTypes,
    certInterpreter,
};

function reduce(info) {
    var out = {};
    //out.tagClass = info.tagClass;
    if (info.child) {
        out.child = info.child.filter(i => i.type.code).map(reduce).filter(z => z);
        if (out.child.length == 1) {
            return out.child[0]
        } else if (out.child.length) return out.child
    } else {

        out.data = info.data;
        out.dataString = info.dataString;
        return info.dataString;
    }
}

// this list if from wikipedia:https://en.wikipedia.org/wiki/X.690
var types = `End-of-Content (EOC)	Primitive	0	0
BOOLEAN	Primitive	1	1
INTEGER	Primitive	2	2
BIT STRING	Primitive	3	3
OCTET STRING	Primitive	4	4
NULL	Primitive	5	5
OBJECT IDENTIFIER	Primitive	6	6
Object Descriptor	Both	7	7
EXTERNAL	Constructed	8	8
REAL (float)	Primitive	9	9
ENUMERATED	Primitive	10	A
EMBEDDED PDV	Constructed	11	B
UTF8String	Both	12	C
RELATIVE-OID	Primitive	13	D
Reserved		14	E
Reserved		15	F
SEQUENCE and SEQUENCE OF	Constructed	16	10
SET and SET OF	Constructed	17	11
NumericString	Both	18	12
PrintableString	Both	19	13
T61String	Both	20	14
VideotexString	Both	21	15
IA5String	Both	22	16
UTCTime	Both	23	17
GeneralizedTime	Both	24	18
GraphicString	Both	25	19
VisibleString	Both	26	1A
GeneralString	Both	27	1B
UniversalString	Both	28	1C
CHARACTER STRING	Primitive	29	1D
BMPString	Both	30	1E`
    .split('\n')
    .map(l => l.split('\t'))
    .map(([name, type, decimal]) => ({
        code: parseInt(decimal),
        type,
        name,
    }));


const typeByCode = {};
types.forEach(t => typeByCode[t.code] = t)


function interpretDerTypes(info, path = '') {
    var copy = Object.assign({}, info);
    if (fieldNames[copy.data.toUpperCase()]) {
        //console.log('>>>>>', path, copy.data.toUpperCase(), fieldNames[copy.data.toUpperCase()])
    }
    if (copy.child) {
        delete copy.data;
        delete copy.dataString;
        if (copy.child.length == 2) {
            // console.log(
            //     coll(path, 8),
            //     coll(copy.child[0].data.toUpperCase()),
            //     coll(copy.child[1].data),
            //     coll(fieldNames[copy.child[0].data.toUpperCase()] || copy.child[0].data, 20),
            //     coll(copy.child[0].type.name, 20),
            //     coll(copy.child[1].type.name, 20),
            //     coll(copy.child[1].dataString, 30),
            // );
            // console.log(copy.child[1])
            return copy;
        } else {
            copy.child = copy.child.map((c, i) => interpretDerTypes(c, path + "." + i));
        }
        return copy;
    } else if (copy.type.type === '') {
        return copy.data
    } else {
        return copy
    }
}

function certInterpreter(info) {
    console.log(JSON.stringify(info.child[0].child[2], undefined, '  '))
    return {
        issuer: info.child[0].child[3].child
            .map(c => c.child[0])
            .map(c => ({
                [fieldNames[c.child[0].data.toUpperCase()] || c.child[0].data.toUpperCase()]: c.child[1].dataString
            }))
            .reduce((u, c) => {
                Object.assign(u, c)
                return u;
            }, {}),
        dueTime: {

        },
        subject: info.child[0].child[5].child
            .map(c => c.child[0])
            .map(c => ({
                [fieldNames[c.child[0].data.toUpperCase()] || c.child[0].data.toUpperCase()]: c.child[1].dataString
            }))
            .reduce((u, c) => {
                Object.assign(u, c)
                return u;
            }, {}),
    }
}




//console.log(typeByCode)

function infoIterator(info, method) {
    var out = method(info);
    if (info.child) {
        out.child = info.child.map(child => infoIterator(child, method));
    }
    return out;
}


function coll(v, length = 8, char = ' ') {
    var s = v + '';
    while (s.length < length) {
        s = s + char;
    }
    return s.substr(0, length).split('\n').join('_').split('\t').join('_');
}

//3082077930820661a00302010202100bfdb4090ad7b5e640c30b16c9529a27300d06092a864886f70d01010b05003075310b300906035504061302555331153013060355040a130c446967694365727420496e6331193017060355040b13107777772e64696769636572742e636f6d313430320603550403132b4469676943657274205348413220457874656e6465642056616c69646174696f6e20536572766572204341301e170d3136303331303030303030305a170d3138303531373132303030305a3081fd311d301b060355040f0c1450726976617465204f7267616e697a6174696f6e31133011060b2b0601040182373c0201031302555331193017060b2b0601040182373c020102130844656c61776172653110300e0603550405130735313537353530312430220603550409131b383820436f6c696e2050204b656c6c792c204a7220537472656574310e300c060355041113053934313037310b3009060355040613025553311330110603550408130a43616c69666f726e6961311630140603550407130d53616e204672616e636973636f31153013060355040a130c4769744875622c20496e632e311330110603550403130a6769746875622e636f6d30820122300d06092a864886f70d01010105000382010f003082010a0282010100e7885cf2965c97181cba98e203f17f399191c26fd996e7284064cd4ca98112036cae7fe6c619e05a63f06c0bd468b3fffd3efd25cfb5597329c4c8b3f4f2bac9945116e228d1dd9bc78db7340ea138bd914ed6e77ecfb2d0f152fd84e94127a54eeabe16ec2db39bfa680c1e37231c603d070726e491da2c1680dc70137327dd8073c2391150d47373abff88d2c99c33c6ef6476606507378732fb2a747f125fd98d6a15ed5f1469c199c18948f0dfa3e037eb3d18b586ada7ddd364f4bb1f58cdde5ece4331ba4a84010ec02882228ef6963c025b2bfe765cb848cb6be918dca5ca78bf0d00f5f1b04f4fe646d6ebf44103fd2ee63f8e83be14a0ce4e57abe30203010001a382037a30820376301f0603551d230418301680143dd350a5d6a0adeef34a600a65d321d4f8f8d60f301d0603551d0e04160414885c486719cca076592d1179c3bea2ac8722275b30250603551d11041e301c820a6769746875622e636f6d820e7777772e6769746875622e636f6d300e0603551d0f0101ff0404030205a0301d0603551d250416301406082b0601050507030106082b0601050507030230750603551d1f046e306c3034a032a030862e687474703a2f2f63726c332e64696769636572742e636f6d2f736861322d65762d7365727665722d67312e63726c3034a032a030862e687474703a2f2f63726c342e64696769636572742e636f6d2f736861322d65762d7365727665722d67312e63726c304b0603551d2004443042303706096086480186fd6c0201302a302806082b06010505070201161c68747470733a2f2f7777772e64696769636572742e636f6d2f4350533007060567810c010130818806082b06010505070101047c307a302406082b060105050730018618687474703a2f2f6f6373702e64696769636572742e636f6d305206082b060105050730028646687474703a2f2f636163657274732e64696769636572742e636f6d2f446967694365727453484132457874656e64656456616c69646174696f6e53657276657243412e637274300c0603551d130101ff040230003082017f060a2b06010401d6790204020482016f0482016b0169007600a4b90990b418581487bb13a2cc67700a3c359804f91bdfb8e377cd0ec80ddc10000001536189ea1e0000040300473045022100871d2118fd138adbfb0e9636ca68d11c296cfa0711c934f3ad8d2cae5674a7e1022027a46abd86d25f5bca2de5fbbe99ce7c201f4b663c941e5134cc24eaeb36422000760068f698f81f6482be3a8ceeb9281d4cfc71515d6793d444d10a67acbb4f4ffbc4000001536189e9e70000040300473045022100d9a5de52fb7b68f24ee57037960618890128984e4dab3404f6ea555a337c615b0220354aab908383669460fa4861a7c6a0eb907c9aed29e095009a44436e262746f60077005614069a2fd7c2ecd3f5e1bd44b23ec74676b9bc99115cc0ef949855d689d0dd000001536189ea990000040300483046022100e79b7592b65bc4f7d1828b34b1f941ad1a6424d964e89283e0a3585f8aff3320022100fad8797ac182c780f635165a807822f99c66db218d7b289d3f0c206d6ed7317c300d06092a864886f70d01010b050003820101008b6cdb64c6eb29ab272af21d44a5b9805f4c0ce43a16ee133f155773e0b2772a67edca4d7277c8ff3d2c51ac040dd8caff7eb29e2bc344d5c3238b7da625b06aa56b4affec02f9abcfa650546cda733f9ddcb93305fd0b2cc48b4f18d3f9fce4fd023d41c40fcda1f5992a1e2e7d5edccf7a584434b8045f84105438979198fb2a7858903fc52bd8b131d6796c510f5fe797adbf45df4537636469c455a330b145595e16b0474c5c6a20fea40e7c622c4941ad99e0b58d3b89eb5a61954b40dfc44f2a8b41fb6c7fc4de7304e495b8ef9bc35326a6da21589f630ab034dfb8951c52dc5e6536503f8a5d7620e81b462a0b23ada8f06d0368451080735ff2f486