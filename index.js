var fieldNames = require('./fieldNames');

module.exports.parse = parse;
module.exports.parsePem = buffer => {
    var buffer = Buffer.from(
            (buffer + '').split('\r').join('')
            .split('\n')
            .filter(line => line.indexOf('-----'))
            .join(''), 'base64')
        //console.log(buffer.toString('hex'))
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
    var octet1 = buffer.readUInt8(0);
    var octet2 = buffer.readUInt8(1);
    var tagClass = tagClasses[(octet1 & 0b11000000) >> 6];
    var type = octet1 & 0x00011111;
    var isConstructed = !!(octet1 & 0b00100000)
    var dataLength; // = buffer.readUInt16BE(2);
    var isShort = !(octet2 & 0b10000000);

    var headerLength;
    var data;
    if (isShort) {
        headerLength = 2;
        dataLength = octet2;
        data = buffer.slice(2, dataLength + 2)
    } else if (octet2 == 0b10000001) {
        headerLength = 3;
        dataLength = buffer.readUInt8(2);
        data = buffer.slice(3, dataLength + 3)
    } else if (octet2 == 0b10000010) {
        headerLength = 4;
        dataLength = buffer.readUInt16BE(2);
        data = buffer.slice(4, dataLength + 4)
    } else if (octet2 == 0b10000100) {
        headerLength = 6;
        dataLength = buffer.readUInt32BE(2);
        data = buffer.slice(6, dataLength + 6)
    } else {
        headerLength: 0
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
    if (fieldNames[copy.data.toUpperCase()]) {}
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
    return {
        serial: info.child[0].child[1].data,
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
            notBefore: parseUTC(info.child[0].child[4].child[0].dataString),
            notAfter: parseUTC(info.child[0].child[4].child[1].dataString)
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


function parseUTC(utc) {
    var year = parseInt(utc.substr(0, 2));
    var thisYear = new Date().getUTCFullYear();
    if((thisYear-80)>(1900+year)){
        year += 2000;
    }else{
        year += 1900;
    }
    var month = -1 + parseInt(utc.substr(2, 2));
    var day = parseInt(utc.substr(4, 2));
    var hour = parseInt(utc.substr(6, 2));
    var minute = parseInt(utc.substr(8, 2));
    var second = parseInt(utc.substr(10, 2));
    return new Date(Date.UTC(year, month, day, hour, minute, second))
}

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